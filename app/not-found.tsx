import Link from "next/link"
import { Frame } from "@/components/frame"

export default function NotFound() {
  return (
    <Frame>
      <h1 className="text-2xl font-extrabold">Listing not found</h1>
      <p className="mt-2 text-sm text-muted">That listing is no longer available.</p>
      <Link href="/" className="mt-4 inline-block font-semibold text-fb">
        Back to Marketplace
      </Link>
    </Frame>
  )
}
