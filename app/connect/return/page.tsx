import Link from "next/link"
import { Suspense } from "react"
import { connection } from "next/server"
import { BrowseShell } from "@/components/browse-shell"
import { syncConnectedAccount } from "@/lib/payments"

async function ReturnStatus({ account }: { account: string }) {
  await connection()
  try {
    const { seller } = await syncConnectedAccount(account)
    if (!seller) {
      return <p className="text-sm text-red-700">This Stripe account is not linked to a seller email.</p>
    }
    if (seller.charges_enabled) {
      return (
        <div className="max-w-lg space-y-3 text-sm leading-6">
          <p className="rounded-xl bg-green-50 px-3 py-2 text-green-800">
            {seller.email} is ready to get paid. Listings that use this email now show Buy Now.
          </p>
          <Link href="/" className="font-semibold text-fb hover:underline">
            Back to listings
          </Link>
        </div>
      )
    }
    return (
      <div className="max-w-lg space-y-3 text-sm leading-6">
        <p>Stripe still needs a few details before {seller.email} can accept payments.</p>
        <Link href={`/connect/refresh?account=${account}`} className="font-semibold text-fb hover:underline">
          Continue onboarding
        </Link>
      </div>
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not confirm the Stripe account."
    return <p className="text-sm text-red-700">{message}</p>
  }
}

export default function ConnectReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>
}) {
  return (
    <BrowseShell title="Stripe account">
      <Suspense fallback={<p className="text-sm text-muted">Checking Stripe...</p>}>
        <ReturnLoader searchParams={searchParams} />
      </Suspense>
    </BrowseShell>
  )
}

async function ReturnLoader({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>
}) {
  const { account } = await searchParams
  if (!account) return <p className="text-sm">Missing Stripe account.</p>
  return <ReturnStatus account={account} />
}
