"use client"

import { useActionState } from "react"
import { buyListing } from "@/app/actions"
import { formatPrice } from "@/lib/format"

export function BuyButton({ listingId, price }: { listingId: string; price: number }) {
  const [state, action, pending] = useActionState(buyListing, {})

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="listingId" value={listingId} />
      {state.error ? <p className="mb-2 text-sm text-red-700">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-fb px-6 py-3 font-bold text-white hover:bg-[#166fe0] disabled:opacity-60"
      >
        {pending ? "Opening checkout..." : `Buy Now · ${formatPrice(price)}`}
      </button>
      <p className="mt-2 text-xs text-muted">Pay with the test card 4242 4242 4242 4242.</p>
    </form>
  )
}
