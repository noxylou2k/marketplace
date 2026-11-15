import type { Listing } from "@/lib/types"

const others = [
  "electronics",
  "electronics",
  "apparel",
  "home-goods",
  "entertainment",
  "garden-outdoor",
  "pet-supplies",
]

export function getSampleListings(): Listing[] {
  const now = Date.now()
  const minutesAgo = (minutes: number) =>
    new Date(now - minutes * 60 * 1000).toISOString()

  const featured: Omit<Listing, "status">[] = [
    {
      id: "car-mustang",
      title: "Ford Mustang",
      description: "Gray Ford Mustang coupe. Clean interior, ready for a test drive in Palo Alto.",
      price: 18500,
      category: "vehicles",
      location: "Palo Alto, CA",
      seller_name: "Alex Kim",
      seller_email: "alex.kim@example.com",
      image_url: "/listings/car-1.jpg",
      created_at: minutesAgo(2),
    },
    {
      id: "car-panamera",
      title: "Porsche Panamera",
      description: "Black Porsche Panamera. Well kept and available in Palo Alto.",
      price: 42000,
      category: "vehicles",
      location: "Palo Alto, CA",
      seller_name: "Alex Kim",
      seller_email: "alex.kim@example.com",
      image_url: "/listings/car-2.jpg",
      created_at: minutesAgo(4),
    },
    {
      id: "car-camaro",
      title: "Chevrolet Camaro",
      description: "Blue Chevrolet Camaro coupe. Garage kept.",
      price: 27900,
      category: "vehicles",
      location: "Palo Alto, CA",
      seller_name: "Alex Kim",
      seller_email: "alex.kim@example.com",
      image_url: "/listings/car-3.jpg",
      created_at: minutesAgo(6),
    },
    {
      id: "car-fiat",
      title: "Fiat 500",
      description: "Light blue Fiat 500. Easy to park and fun to drive.",
      price: 8400,
      category: "vehicles",
      location: "Palo Alto, CA",
      seller_name: "Alex Kim",
      seller_email: "alex.kim@example.com",
      image_url: "/listings/car-4.jpg",
      created_at: minutesAgo(8),
    },
    {
      id: "bike-peugeot",
      title: "Peugeot road bike",
      description: "White Peugeot road bike with brown leather saddle.",
      price: 450,
      category: "sporting-goods",
      location: "Palo Alto, CA",
      seller_name: "Wei Gu",
      seller_email: "wei.gu@example.com",
      image_url: "/listings/bike-1.jpg",
      created_at: minutesAgo(10),
    },
    {
      id: "bike-road",
      title: "Black road bike",
      description: "Lightweight black road bike with deep carbon wheels.",
      price: 1200,
      category: "sporting-goods",
      location: "Palo Alto, CA",
      seller_name: "Wei Gu",
      seller_email: "wei.gu@example.com",
      image_url: "/listings/bike-2.jpg",
      created_at: minutesAgo(12),
    },
    {
      id: "bike-city",
      title: "Silver city bike",
      description: "Simple silver city bike, recently tuned.",
      price: 220,
      category: "sporting-goods",
      location: "Palo Alto, CA",
      seller_name: "Wei Gu",
      seller_email: "wei.gu@example.com",
      image_url: "/listings/bike-3.jpg",
      created_at: minutesAgo(14),
    },
    {
      id: "bike-24",
      title: "Bike 24 inch",
      description: "A 24 inch bike, ready for a new rider around Palo Alto.",
      price: 99,
      category: "sporting-goods",
      location: "Palo Alto, CA",
      seller_name: "Wei Gu",
      seller_email: "wei.gu@example.com",
      image_url: "/listings/bike-4.jpg",
      created_at: minutesAgo(60),
    },
  ]

  const fillers: Omit<Listing, "status">[] = others.map((category, index) => ({
    id: `sample-${index + 1}`,
    title: "Lorem ipsum dolor sit",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    price: 2300,
    category,
    location: "Palo Alto, CA",
    seller_name: "Alex Kim",
    seller_email: "alex.kim@example.com",
    image_url: null,
    created_at: minutesAgo(90 + index),
  }))

  return [...featured, ...fillers].map((listing) => ({ ...listing, status: "available" as const }))
}
