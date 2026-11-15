export function SearchForm({
  action = "/",
  query = "",
}: {
  action?: string
  query?: string
}) {
  return (
    <form action={action} className="mb-5">
      <label className="sr-only" htmlFor="q">
        Search listings
      </label>
      <input
        id="q"
        name="q"
        defaultValue={query}
        placeholder="Search listings, try bike"
        className="w-full max-w-sm rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-fb"
      />
    </form>
  )
}
