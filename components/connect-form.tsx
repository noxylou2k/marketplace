"use client"

import { useActionState } from "react"
import { connectStripe } from "@/app/actions"

const fieldClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-fb"

export function ConnectForm({ error }: { error?: string }) {
  const [state, action, pending] = useActionState(connectStripe, {})

  return (
    <form action={action} className="max-w-md space-y-4">
      <p className="text-sm leading-6 text-neutral-800">
        Use the same email as your listings. In Stripe's test form, use any future date of birth,
        SSN 000-00-0000, routing 110000000, and account 000123456789. After onboarding, every
        listing with this email can be bought.
      </p>
      {error || state.error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error || error}</p>
      ) : null}
      <label className="block text-sm font-medium" htmlFor="email">
        Seller email
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="seller@email.com"
          className={`mt-1 ${fieldClass}`}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-fb px-6 py-2.5 font-bold text-white hover:bg-[#166fe0] disabled:opacity-60"
      >
        {pending ? "Opening Stripe..." : "Connect with Stripe"}
      </button>
    </form>
  )
}
