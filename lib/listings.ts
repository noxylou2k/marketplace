import { randomUUID } from "crypto"
import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"
import { connection } from "next/server"
import { getSampleListings } from "@/lib/sample-listings"
import { getSupabase } from "@/lib/supabase"
import type { BuyerMessage, Listing } from "@/lib/types"

type LocalDb = {
  listings: Listing[]
  messages: BuyerMessage[]
}

const dbPath = path.join(process.cwd(), "data", "db.json")
const uploadDir = path.join(process.cwd(), "public", "uploads")

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function mapListing(row: Record<string, unknown>): Listing {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    price: Number(row.price ?? 0),
    category: String(row.category ?? ""),
    location: String(row.location ?? ""),
    seller_name: String(row.seller_name ?? ""),
    seller_email: String(row.seller_email ?? ""),
    image_url: row.image_url ? String(row.image_url) : null,
    created_at: String(row.created_at ?? new Date().toISOString()),
  }
}

async function readLocal(): Promise<LocalDb> {
  try {
    const raw = await readFile(dbPath, "utf8")
    const parsed = JSON.parse(raw) as LocalDb
    return {
      listings: Array.isArray(parsed.listings) ? parsed.listings : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    }
  } catch {
    return { listings: [], messages: [] }
  }
}

async function writeLocal(db: LocalDb) {
  await mkdir(path.dirname(dbPath), { recursive: true })
  await writeFile(dbPath, JSON.stringify(db, null, 2))
}

function matchesQuery(listing: Listing, query: string) {
  const haystack = [
    listing.title,
    listing.description,
    listing.location,
    listing.seller_name,
    listing.category.replaceAll("-", " "),
  ]
    .join(" ")
    .toLowerCase()
  return haystack.includes(query.toLowerCase())
}

async function loadAll(): Promise<Listing[]> {
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => mapListing(row as Record<string, unknown>))
  }

  const local = await readLocal()
  return [...local.listings, ...getSampleListings()]
}

export async function getListings(filters: { category?: string; query?: string } = {}) {
  await connection()
  try {
    const listings = (await loadAll())
      .filter((listing) => {
        if (filters.category && listing.category !== filters.category) return false
        if (filters.query && !matchesQuery(listing, filters.query)) return false
        return true
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    return { listings }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load listings"
    return { listings: [] as Listing[], error: message }
  }
}

export async function getListing(id: string) {
  await connection()
  try {
    const supabase = getSupabase()
    if (supabase) {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .maybeSingle()
      if (error) throw new Error(error.message)
      return {
        listing: data ? mapListing(data as Record<string, unknown>) : null,
      }
    }

    const listings = await loadAll()
    return { listing: listings.find((listing) => listing.id === id) ?? null }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load listing"
    return { listing: null, error: message }
  }
}

async function storeImage(bytes: Buffer, contentType: string) {
  const extension = imageTypes[contentType]
  if (!extension) throw new Error("Use a JPEG, PNG, or WebP photo.")

  const filename = `${randomUUID()}.${extension}`
  const supabase = getSupabase()

  if (supabase) {
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(filename, bytes, { contentType, upsert: false })
    if (error) throw new Error(error.message)
    const { data } = supabase.storage.from("listing-images").getPublicUrl(filename)
    return data.publicUrl
  }

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), bytes)
  return `/uploads/${filename}`
}

export async function createListingRecord(input: {
  title: string
  description: string
  price: number
  category: string
  location: string
  sellerName: string
  sellerEmail: string
  photo: { bytes: Buffer; contentType: string }
}) {
  const imageUrl = await storeImage(input.photo.bytes, input.photo.contentType)
  const listing: Listing = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    price: input.price,
    category: input.category,
    location: input.location,
    seller_name: input.sellerName,
    seller_email: input.sellerEmail,
    image_url: imageUrl,
    created_at: new Date().toISOString(),
  }

  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        location: listing.location,
        seller_name: listing.seller_name,
        seller_email: listing.seller_email,
        image_url: listing.image_url,
      })
      .select("*")
      .single()
    if (error) throw new Error(error.message)
    return mapListing(data as Record<string, unknown>)
  }

  const db = await readLocal()
  db.listings.unshift(listing)
  await writeLocal(db)
  return listing
}

export async function createMessageRecord(input: {
  listingId: string
  buyerEmail: string
  sellerEmail: string
  message: string
}) {
  const supabase = getSupabase()
  if (supabase) {
    const { error } = await supabase.from("messages").insert({
      listing_id: input.listingId,
      buyer_email: input.buyerEmail,
      seller_email: input.sellerEmail,
      message: input.message,
    })
    if (error) throw new Error(error.message)
    return
  }

  const db = await readLocal()
  db.messages.unshift({
    id: randomUUID(),
    listing_id: input.listingId,
    buyer_email: input.buyerEmail,
    seller_email: input.sellerEmail,
    message: input.message,
    created_at: new Date().toISOString(),
  })
  await writeLocal(db)
}
