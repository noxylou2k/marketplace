import { NextResponse } from "next/server"
import { createOnboardingLink } from "@/lib/payments"
import { appOrigin } from "@/lib/stripe"

export async function GET(request: Request) {
  const account = new URL(request.url).searchParams.get("account")
  if (!account) {
    return NextResponse.redirect(new URL("/connect", request.url))
  }

  try {
    const url = await createOnboardingLink(account, appOrigin(request.headers))
    return NextResponse.redirect(url)
  } catch {
    const back = new URL("/connect", request.url)
    back.searchParams.set("error", "The Stripe link expired. Start again.")
    return NextResponse.redirect(back)
  }
}
