import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const url = process.argv[2]

if (!url) {
  console.error("Usage: node --env-file=.env.local scripts/create-webhook.mjs https://YOUR-APP.vercel.app/api/stripe/webhook")
  process.exit(1)
}

const endpoint = await stripe.webhookEndpoints.create({
  url,
  connect: true,
  enabled_events: ["checkout.session.completed", "account.updated"],
})

console.log(endpoint.secret)
console.log(endpoint.id)
