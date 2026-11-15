import { getStripe } from "@/lib/stripe"
import { fulfillCheckoutSession, syncConnectedAccount } from "@/lib/payments"
import { getSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: "Webhook secret is not configured." }, { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return Response.json({ error: "Missing signature." }, { status: 400 })
  }

  const stripe = getStripe()
  const body = await request.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch {
    return Response.json({ error: "Invalid signature." }, { status: 400 })
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object
      const listingId = session.metadata?.listing_id
      if (!listingId) return Response.json({ received: true, ignored: true })

      const supabase = getSupabase()
      if (!supabase) {
        return Response.json({ error: "Supabase is not configured." }, { status: 500 })
      }
      const { data } = await supabase.from("listings").select("id").eq("id", listingId).maybeSingle()
      if (!data) return Response.json({ received: true, ignored: true })

      await fulfillCheckoutSession(session)
    }

    if (event.type === "account.updated" && event.account) {
      const supabase = getSupabase()
      if (supabase) {
        const { data } = await supabase
          .from("sellers")
          .select("email")
          .eq("stripe_account_id", event.account)
          .maybeSingle()
        if (data) await syncConnectedAccount(event.account)
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed."
    return Response.json({ error: message }, { status: 500 })
  }

  return Response.json({ received: true })
}
