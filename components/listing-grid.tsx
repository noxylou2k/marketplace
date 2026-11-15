import Link from "next/link"
import { ListingPhoto } from "@/components/listing-photo"
import { formatPrice } from "@/lib/format"
import type { Listing } from "@/lib/types"

export function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      {listings.map((listing) => (
        <Link key={listing.id} href={`/item/${listing.id}`} className="group block min-w-0">
          <ListingPhoto
            src={listing.image_url}
            alt={listing.title}
            className="aspect-square w-full transition group-hover:brightness-95"
          />
          <p className="mt-2 text-lg font-bold leading-tight">
            {formatPrice(listing.price)}
            {listing.status === "sold" ? (
              <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wide text-muted">
                Sold
              </span>
            ) : null}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-5">{listing.title}</p>
          <p className="mt-1 text-xs text-muted">{listing.location}</p>
        </Link>
      ))}
    </div>
  )
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-square animate-pulse rounded-[1.25rem] border-[3px] border-neutral-900/20 bg-[#c5e4f8]" />
          <div className="mt-3 h-4 w-16 animate-pulse rounded bg-black/10" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-black/10" />
          <div className="mt-2 h-3 w-20 animate-pulse rounded bg-black/10" />
        </div>
      ))}
    </div>
  )
}
