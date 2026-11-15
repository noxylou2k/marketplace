import { notFound } from "next/navigation"
import { Suspense } from "react"
import { BrowseShell } from "@/components/browse-shell"
import { GridSkeleton, ListingGrid } from "@/components/listing-grid"
import { categories, categoryBySlug } from "@/lib/categories"
import { getListings } from "@/lib/listings"

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }))
}

async function CategoryResults({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { slug } = await params
  const category = categoryBySlug(slug)
  if (!category) notFound()

  const { q } = await searchParams
  const query = q?.trim() ?? ""
  const { listings, error } = await getListings({
    category: category.slug,
    query: query || undefined,
  })

  return (
    <BrowseShell
      title={category.name}
      active={category.slug}
      query={query}
      searchAction={`/category/${category.slug}`}
    >
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {listings.length === 0 ? (
        <p className="text-sm text-muted">No listings in {category.name} yet.</p>
      ) : (
        <ListingGrid listings={listings} />
      )}
    </BrowseShell>
  )
}

export default function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  return (
    <Suspense
      fallback={
        <BrowseShell title="Category">
          <GridSkeleton />
        </BrowseShell>
      }
    >
      <CategoryResults params={params} searchParams={searchParams} />
    </Suspense>
  )
}
