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
