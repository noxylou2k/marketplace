import { Suspense } from "react"
import { BrowseShell } from "@/components/browse-shell"
import { GridSkeleton, ListingGrid } from "@/components/listing-grid"
import { getListings } from "@/lib/listings"

async function HomeResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const { listings, error } = await getListings({ query: query || undefined })

  return (
    <BrowseShell title="Today's picks" query={query}>
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {listings.length === 0 ? (
        <p className="text-sm text-muted">No listings yet. Create one to get started.</p>
      ) : (
        <ListingGrid listings={listings} />
      )}
    </BrowseShell>
  )
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <Suspense
      fallback={
        <BrowseShell title="Today's picks">
          <GridSkeleton />
        </BrowseShell>
      }
    >
      <HomeResults searchParams={searchParams} />
    </Suspense>
  )
}
