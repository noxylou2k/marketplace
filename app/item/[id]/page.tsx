import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BackButton } from "@/components/back-button"
import { Brand } from "@/components/brand"
import { Frame } from "@/components/frame"
import { ListingPhoto } from "@/components/listing-photo"
import { BuyButton } from "@/components/buy-button"
import { MessageForm } from "@/components/message-form"
import { formatPrice, listedAgo } from "@/lib/format"
import { categoryBySlug } from "@/lib/categories"
import { getListing } from "@/lib/listings"
import { getSellerByEmail } from "@/lib/payments"

export function generateStaticParams() {
  return [{ id: "bike-24" }]
}

async function ItemDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { listing, error } = await getListing(id)
  if (error) {
    return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
  }
  if (!listing) notFound()

  const category = categoryBySlug(listing.category)
  const seller = listing.seller_name || listing.seller_email
  let sellerAccount = null
  try {
    sellerAccount = await getSellerByEmail(listing.seller_email)
  } catch {
    sellerAccount = null
  }
  const canBuy =
    listing.status !== "sold" &&
    Boolean(sellerAccount?.stripe_account_id && sellerAccount.charges_enabled)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(240px,0.75fr)]">
      <ListingPhoto
        src={listing.image_url}
        alt={listing.title}
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="aspect-square w-full lg:aspect-auto lg:min-h-[640px]"
      />
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{listing.title}</h1>
        <p className="text-2xl font-extrabold">
          {formatPrice(listing.price)}
          {listing.status === "sold" ? (
            <span className="ml-2 align-middle text-sm font-semibold uppercase tracking-wide text-muted">
              Sold
            </span>
          ) : null}
        </p>
        {listing.status === "sold" ? null : canBuy ? (
          <BuyButton listingId={listing.id} price={listing.price} />
        ) : (
          <p className="mt-6 text-sm text-muted">
            This seller has not connected Stripe yet, so the listing is not for sale.
          </p>
        )}
        <p className="mt-4 text-sm leading-6 text-neutral-800">
          {listedAgo(listing.created_at)}
          <br />
          in {listing.location}
        </p>
        {listing.description ? (
          <p className="mt-4 text-sm leading-6 text-neutral-800">{listing.description}</p>
        ) : null}
        {category ? (
          <p className="mt-3 text-sm">
            <Link href={`/category/${category.slug}`} className="text-fb hover:underline">
              {category.name}
            </Link>
          </p>
        ) : null}
        <h2 className="mt-6 font-extrabold">Seller Information</h2>
        <p className="mt-1">{seller}</p>
        {listing.seller_name ? (
          <p className="text-sm text-muted">{listing.seller_email}</p>
        ) : null}
        <MessageForm listingId={listing.id} title={listing.title} />
      </div>
    </div>
  )
}

export default function ItemPage({ params }: PageProps<"/item/[id]">) {
  return (
    <Frame>
      <div className="mb-5">
        <BackButton />
        <Brand />
      </div>
      <Suspense fallback={<div className="aspect-square animate-pulse rounded-[1.25rem] bg-[#c5e4f8] lg:min-h-[640px]" />}>
        <ItemDetails params={params} />
      </Suspense>
    </Frame>
  )
}
