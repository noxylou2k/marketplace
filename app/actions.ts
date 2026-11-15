"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { isCategorySlug } from "@/lib/categories"
import { createListingRecord, createMessageRecord, getListing } from "@/lib/listings"
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
  const sellerEmail = text(formData, "sellerEmail")
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
