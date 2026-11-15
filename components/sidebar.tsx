import Link from "next/link"
import { categories } from "@/lib/categories"
import { Brand } from "@/components/brand"

export function Sidebar({ active }: { active?: string }) {
  return (
    <aside className="w-full shrink-0 md:w-52">
      <Brand />
      <Link
        href="/create"
        className="mt-6 block text-sm font-semibold text-fb hover:underline"
      >
        Create listing
      </Link>
      <Link
        href="/connect"
        className="mt-2 block text-sm font-semibold text-fb hover:underline"
      >
        Connect with Stripe
      </Link>
      <h2 className="mt-6 mb-2 text-base font-bold">Categories</h2>
      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-0 md:overflow-visible md:pb-0">
        {categories.map((category) => {
          const selected = category.slug === active
          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="shrink-0 rounded-md px-1 py-1 text-sm text-neutral-900 hover:bg-black/5 md:px-1"
              aria-current={selected ? "page" : undefined}
            >
              <span
                className={
                  selected
                    ? "rounded bg-[#b9d6ff] px-1.5 py-0.5 font-medium text-[#084e9b]"
                    : undefined
                }
              >
                {category.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
