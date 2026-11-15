export type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  seller_name: string
  seller_email: string
  image_url: string | null
  status: "available" | "sold"
  created_at: string
}

export type Seller = {
  email: string
  stripe_account_id: string | null
  charges_enabled: boolean
  details_submitted: boolean
}

export type Order = {
  id: string
  listing_id: string
  buyer_email: string
  seller_email: string
  stripe_account_id: string
  stripe_session_id: string | null
  amount_cents: number
  fee_cents: number
  status: string
  created_at: string
}

export type BuyerMessage = {
  id: string
  listing_id: string
  buyer_email: string
  seller_email: string
  message: string
  created_at: string
}

export type FormState = {
  error?: string
  success?: string
}
