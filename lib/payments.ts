import { revalidatePath } from "next/cache"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { getSupabase } from "@/lib/supabase"
import type { Seller } from "@/lib/types"

const stripePreview = { apiVersion: "2026-10-28.preview" }

function cardPaymentsActive(account: Stripe.V2.Core.Account) {
  return account.configuration?.merchant?.capabilities?.card_payments?.status === "active"
}

export const platformFeeRate = 0.1

export function priceToCents(price: number) {
  return Math.round(Number(price) * 100)
}

export function platformFeeCents(amountCents: number) {
  return Math.round(amountCents * platformFeeRate)
}

function requireDb() {
  const supabase = getSupabase()
  if (!supabase) throw new Error("Supabase is not configured.")
  return supabase
}

export async function getSellerByEmail(email: string): Promise<Seller | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from("sellers")
    .select("email, stripe_account_id, charges_enabled, details_submitted")
    .ilike("email", email)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    email: String(data.email),
    stripe_account_id: data.stripe_account_id ? String(data.stripe_account_id) : null,
    charges_enabled: Boolean(data.charges_enabled),
    details_submitted: Boolean(data.details_submitted),
  }
}

export async function saveSeller(input: {
  email: string
  stripeAccountId: string
  chargesEnabled: boolean
  detailsSubmitted: boolean
}) {
  const supabase = requireDb()
  const email = input.email.trim().toLowerCase()
  const { error } = await supabase.from("sellers").upsert(
    {
      email,
      stripe_account_id: input.stripeAccountId,
      charges_enabled: input.chargesEnabled,
      details_submitted: input.detailsSubmitted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  )
  if (error) throw new Error(error.message)
}

export async function createConnectedAccount(email: string) {
  const stripe = getStripe()
  return stripe.v2.core.accounts.create(
    {
      contact_email: email,
      dashboard: "express",
      identity: { country: "US" },
      defaults: {
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        } as Stripe.V2.Core.AccountCreateParams.Defaults.Responsibilities,
      },
      configuration: {
        merchant: {
          capabilities: {
            card_payments: { requested: true },
          },
        },
      },
      include: ["configuration.merchant"],
    },
    stripePreview,
  )
}

export async function syncConnectedAccount(accountId: string) {
  const stripe = getStripe()
  const account = await stripe.v2.core.accounts.retrieve(
    accountId,
    { include: ["configuration.merchant"] },
    stripePreview,
  )
  const ready = cardPaymentsActive(account)
  const supabase = requireDb()
  const { data, error } = await supabase
    .from("sellers")
    .update({
      charges_enabled: ready,
      details_submitted: ready,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", accountId)
    .select("email, stripe_account_id, charges_enabled, details_submitted")
    .maybeSingle()
  if (error) throw new Error(error.message)
  return {
    account,
    seller: data
      ? {
          email: String(data.email),
          stripe_account_id: data.stripe_account_id ? String(data.stripe_account_id) : null,
          charges_enabled: Boolean(data.charges_enabled),
          details_submitted: Boolean(data.details_submitted),
        }
      : null,
  }
}

export async function createOnboardingLink(accountId: string, origin: string) {
  const stripe = getStripe()
  const link = await stripe.v2.core.accountLinks.create(
    {
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          refresh_url: `${origin}/connect/refresh?account=${accountId}`,
          return_url: `${origin}/connect/return?account=${accountId}`,
        },
      },
    },
    stripePreview,
  )
  return link.url
}

export async function recordPendingOrder(input: {
  listingId: string
  buyerEmail?: string
  sellerEmail: string
  stripeAccountId: string
  stripeSessionId: string
  amountCents: number
  feeCents: number
}) {
  const supabase = requireDb()
  const { error } = await supabase.from("orders").upsert(
    {
      listing_id: input.listingId,
      buyer_email: input.buyerEmail ?? "",
      seller_email: input.sellerEmail,
      stripe_account_id: input.stripeAccountId,
      stripe_session_id: input.stripeSessionId,
      amount_cents: input.amountCents,
      fee_cents: input.feeCents,
      status: "pending",
    },
    { onConflict: "stripe_session_id" },
  )
  if (error) throw new Error(error.message)
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const listingId = session.metadata?.listing_id
  const sellerEmail = session.metadata?.seller_email
  const stripeAccountId = session.metadata?.stripe_account_id
  if (!listingId || !sellerEmail || !stripeAccountId) return { recognized: false }
  if (session.payment_status !== "paid") return { recognized: true, paid: false }

  const supabase = requireDb()
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .maybeSingle()
  if (listingError) throw new Error(listingError.message)
  if (!listing) return { recognized: false }

  const buyerEmail = session.customer_details?.email ?? session.customer_email ?? ""
  const amountCents = session.amount_total ?? 0
  const feeCents = Number(session.metadata?.fee_cents ?? platformFeeCents(amountCents))

  const { error: orderError } = await supabase.from("orders").upsert(
    {
      listing_id: listingId,
      buyer_email: buyerEmail,
      seller_email: sellerEmail,
      stripe_account_id: stripeAccountId,
      stripe_session_id: session.id,
      amount_cents: amountCents,
      fee_cents: feeCents,
      status: "paid",
    },
    { onConflict: "stripe_session_id" },
  )
  if (orderError) throw new Error(orderError.message)

  const { error: soldError } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
  if (soldError) throw new Error(soldError.message)

  revalidatePath("/")
  revalidatePath(`/item/${listingId}`)
  return { recognized: true, paid: true, listingId }
}
