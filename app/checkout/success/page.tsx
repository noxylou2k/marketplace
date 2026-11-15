import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { BrowseShell } from "@/components/browse-shell"
import { formatPrice } from "@/lib/format"
import { fulfillCheckoutSession } from "@/lib/payments"
import { getStripe } from "@/lib/stripe"

async function SuccessDetails({
  sessionId,
  account,
}: {
  sessionId: string
  account: string
}) {
  await connection()
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId, undefined, {
      stripeAccount: account,
    })
    await fulfillCheckoutSession(session)
    const paid = session.payment_status === "paid"
    const amount = (session.amount_total ?? 0) / 100
    const listingId = session.metadata?.listing_id

    return (
      <div className="max-w-lg space-y-3 text-sm leading-6">
        <p className={`rounded-xl px-3 py-2 ${paid ? "bg-green-50 text-green-800" : "bg-white"}`}>
          {paid
            ? `Payment received for ${formatPrice(amount)}. The seller is paid minus a 10% marketplace fee, and the listing is marked sold.`
            : "Checkout is not paid yet."}
        </p>
        {listingId ? (
          <Link href={`/item/${listingId}`} className="font-semibold text-fb hover:underline">
            View listing
          </Link>
        ) : (
          <Link href="/" className="font-semibold text-fb hover:underline">
            Back to listings
          </Link>
        )}
      </div>
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not confirm the payment."
    return <p className="text-sm text-red-700">{message}</p>
  }
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; account?: string }>
}) {
  return (
    <BrowseShell title="Order confirmed">
      <Suspense fallback={<p className="text-sm text-muted">Confirming payment...</p>}>
        <SuccessLoader searchParams={searchParams} />
      </Suspense>
    </BrowseShell>
  )
}

async function SuccessLoader({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; account?: string }>
}) {
  const { session_id: sessionId, account } = await searchParams
  if (!sessionId || !account) return <p className="text-sm">Missing checkout session.</p>
  return <SuccessDetails sessionId={sessionId} account={account} />
}
