import Stripe from "stripe"

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("Stripe is not configured.")
  return new Stripe(key)
}

export function appOrigin(headerStore: Headers) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
  if (configured) return configured
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const proto = headerStore.get("x-forwarded-proto") ?? "http"
  if (!host) throw new Error("Could not determine the app URL.")
  return `${proto}://${host}`
}
