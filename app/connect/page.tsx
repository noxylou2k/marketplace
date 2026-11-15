import { Suspense } from "react"
import { BrowseShell } from "@/components/browse-shell"
import { ConnectForm } from "@/components/connect-form"

export default function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <BrowseShell title="Connect with Stripe">
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <ConnectFormLoader searchParams={searchParams} />
      </Suspense>
    </BrowseShell>
  )
}

async function ConnectFormLoader({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  return <ConnectForm error={error} />
}
