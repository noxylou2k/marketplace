import Link from "next/link"

export function Brand({ stacked = true }: { stacked?: boolean }) {
  return (
    <Link
      href="/"
      className={stacked ? "block w-fit" : "flex w-fit items-center gap-3"}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-fb text-lg font-bold text-white">
        F
      </span>
      <span
        className={
          stacked
            ? "mt-2 block text-lg font-extrabold tracking-tight"
            : "text-xl font-extrabold tracking-tight"
        }
      >
        Marketplace
      </span>
    </Link>
  )
}
