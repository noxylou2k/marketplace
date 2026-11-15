"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { isCategorySlug } from "@/lib/categories"
import { createListingRecord, createMessageRecord, getListing } from "@/lib/listings"
import {
  createConnectedAccount,
  createOnboardingLink,
  getSellerByEmail,
  platformFeeCents,
  priceToCents,
  recordPendingOrder,
  saveSeller,
} from "@/lib/payments"
import { appOrigin, getStripe } from "@/lib/stripe"
import type { FormState } from "@/lib/types"

const maxPhotoBytes = 5 * 1024 * 1024
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export async function createListing(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = text(formData, "title")
  const description = text(formData, "description")
  const category = text(formData, "category")
  const location = text(formData, "location") || "Palo Alto, CA"
  const sellerName = text(formData, "sellerName")
  const sellerEmail = text(formData, "sellerEmail").toLowerCase()
  const price = Number(text(formData, "price"))
  const photo = formData.get("photo")

  if (!title) return { error: "Add a title." }
  if (!isCategorySlug(category)) return { error: "Choose a category." }
  if (!Number.isFinite(price) || price < 0) return { error: "Enter a valid price." }
  if (!emailPattern.test(sellerEmail)) return { error: "Enter a valid contact email." }
  if (!(photo instanceof File) || photo.size === 0) return { error: "Add a photo." }
  if (photo.size > maxPhotoBytes) return { error: "Photo must be 5MB or smaller." }
  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    return { error: "Use a JPEG, PNG, or WebP photo." }
  }

  let listing
  try {
    listing = await createListingRecord({
      title,
      description,
      price,
      category,
      location,
      sellerName,
      sellerEmail,
      photo: {
        bytes: Buffer.from(await photo.arrayBuffer()),
        contentType: photo.type,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create listing."
    return { error: message }
  }

  revalidatePath("/")
  revalidatePath(`/category/${category}`)
  redirect(`/item/${listing.id}`)
}

export async function sendMessage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const listingId = text(formData, "listingId")
  const buyerEmail = text(formData, "buyerEmail")
  const message = text(formData, "message")

  if (!emailPattern.test(buyerEmail)) return { error: "Enter a valid email." }
  if (!message) return { error: "Write a message." }

  const { listing, error } = await getListing(listingId)
  if (error) return { error }
  if (!listing) return { error: "This listing is no longer available." }

  try {
    await createMessageRecord({
      listingId: listing.id,
      buyerEmail,
      sellerEmail: listing.seller_email,
      message,
    })
    revalidatePath(`/item/${listing.id}`)
    return { success: `Message sent to ${listing.seller_name || listing.seller_email}.` }
  } catch (sendError) {
    const messageText =
      sendError instanceof Error ? sendError.message : "Could not send message."
    return { error: messageText }
  }
}

export async function connectStripe(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = text(formData, "email").toLowerCase()
  if (!emailPattern.test(email)) return { error: "Enter the email on your listings." }

  let url: string
  try {
    const origin = appOrigin(await headers())
    const existing = await getSellerByEmail(email)
    let accountId = existing?.stripe_account_id ?? null

    if (!accountId) {
      const account = await createConnectedAccount(email)
      accountId = account.id
      const ready =
        account.configuration?.merchant?.capabilities?.card_payments?.status === "active"
      await saveSeller({
        email,
        stripeAccountId: account.id,
        chargesEnabled: ready,
        detailsSubmitted: ready,
      })
    }

    url = await createOnboardingLink(accountId, origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start Stripe onboarding."
    if (message.includes("sellers") || message.includes("schema cache")) {
      return {
        error: "Payments tables are not in Supabase yet. Run supabase-schema.sql in the SQL editor, then try again.",
      }
    }
    return { error: message }
  }

  redirect(url)
}

export async function buyListing(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const listingId = text(formData, "listingId")
  const { listing, error } = await getListing(listingId)
  if (error) return { error }
  if (!listing) return { error: "This listing is no longer available." }
  if (listing.status === "sold") return { error: "This listing has already sold." }

  const amountCents = priceToCents(listing.price)
  if (amountCents < 50) return { error: "Stripe checkout needs a price of at least $0.50." }

  let checkoutUrl: string
  try {
    const seller = await getSellerByEmail(listing.seller_email)
    if (!seller?.stripe_account_id || !seller.charges_enabled) {
      return { error: "This seller is not ready to take payments yet." }
    }

    const stripe = getStripe()
    const origin = appOrigin(await headers())
    const feeCents = platformFeeCents(amountCents)
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amountCents,
              product_data: { name: listing.title },
            },
          },
        ],
        payment_intent_data: {
          application_fee_amount: feeCents,
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&account=${seller.stripe_account_id}`,
        cancel_url: `${origin}/item/${listing.id}`,
        metadata: {
          listing_id: listing.id,
          seller_email: listing.seller_email,
          stripe_account_id: seller.stripe_account_id,
          fee_cents: String(feeCents),
        },
      },
      { stripeAccount: seller.stripe_account_id },
    )

    if (!session.url) return { error: "Stripe did not return a checkout link." }
    await recordPendingOrder({
      listingId: listing.id,
      sellerEmail: listing.seller_email,
      stripeAccountId: seller.stripe_account_id,
      stripeSessionId: session.id,
      amountCents,
      feeCents,
    })
    checkoutUrl = session.url
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout."
    return { error: message }
  }

  redirect(checkoutUrl)
}
