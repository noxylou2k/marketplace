import { Frame } from "@/components/frame"
import { SearchForm } from "@/components/search-form"
import { Sidebar } from "@/components/sidebar"

export function BrowseShell({
  title,
  active,
  query = "",
  searchAction = "/",
  children,
}: {
  title: string
  active?: string
  query?: string
  searchAction?: string
  children: React.ReactNode
}) {
  return (
    <Frame>
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <Sidebar active={active} />
        <section className="min-w-0 flex-1">
          <h1 className="mb-3 text-2xl font-extrabold tracking-tight">{title}</h1>
          <SearchForm action={searchAction} query={query} />
          {query ? (
            <p className="mb-4 text-sm text-muted">
              Showing results for “{query}”
            </p>
          ) : null}
          {children}
        </section>
      </div>
    </Frame>
  )
}
