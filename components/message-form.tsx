"use client"

import { useActionState } from "react"
import { sendMessage } from "@/app/actions"

export function MessageForm({
  listingId,
  title,
}: {
  listingId: string
  title: string
}) {
  const [state, action, pending] = useActionState(sendMessage, {})
  const noun = title.toLowerCase().includes("bike") ? "bike" : "item"

  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="listingId" value={listingId} />
      <h2 className="text-sm font-medium">Send seller a message</h2>
      {state.error ? <p className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state.success ? <p className="mt-2 text-sm text-green-700">{state.success}</p> : null}
      <label className="mt-3 block text-sm" htmlFor="buyerEmail">
        Your email
        <input
          id="buyerEmail"
          name="buyerEmail"
          type="email"
          required
          placeholder="you@email.com"
          className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 outline-none focus:border-fb"
        />
      </label>
      <label className="mt-3 block text-sm" htmlFor="message">
        Message
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={`I want to buy your ${noun}!`}
          className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-3 outline-none focus:border-fb"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-fb px-10 py-2.5 font-bold text-white hover:bg-[#166fe0] disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send"}
      </button>
    </form>
  )
}
