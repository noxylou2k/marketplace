"use client"

import { useState } from "react"
import { useActionState } from "react"
import { createListing } from "@/app/actions"
import { ListingPhoto } from "@/components/listing-photo"
import { categories } from "@/lib/categories"
import { formatPrice } from "@/lib/format"

const fieldClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 outline-none focus:border-fb"

export function CreateListingForm({ localMode }: { localMode: boolean }) {
  const [state, action, pending] = useActionState(createListing, {})
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [location, setLocation] = useState("Palo Alto, CA")
  const [sellerName, setSellerName] = useState("")
  const [sellerEmail, setSellerEmail] = useState("")
  const [preview, setPreview] = useState<string | null>(null)

  const priceNumber = Number(price)
  const priceLabel =
    price.trim() && Number.isFinite(priceNumber) ? formatPrice(priceNumber) : "Price"

  return (
    <form action={action} className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {localMode ? (
          <p className="rounded-xl bg-white px-3 py-2 text-sm text-muted">
            Saving on this computer. Add NEXT_PUBLIC_SUPABASE_URL and
            NEXT_PUBLIC_SUPABASE_ANON_KEY to store listings in Supabase.
          </p>
        ) : null}
        {state.error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        ) : null}

        <div>
          <label htmlFor="photo" className="mb-1 block text-sm font-medium">
            Photos
          </label>
          <label
            htmlFor="photo"
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 bg-white px-4 py-8 text-center"
          >
            {preview ? (
              <span
                className="h-28 w-full rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url("${preview}")` }}
              />
            ) : (
              <>
                <span className="text-2xl text-muted">↑</span>
                <span className="mt-2 text-sm font-medium">Add photos</span>
                <span className="mt-1 text-xs text-muted">JPEG, PNG, or WebP (max 5MB)</span>
              </>
            )}
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              setPreview(file ? URL.createObjectURL(file) : null)
            }}
          />
        </div>

        <label className="block text-sm font-medium" htmlFor="title">
          Title *
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What are you selling?"
            className={`${fieldClass} mt-1`}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="category">
          Category *
          <select id="category" name="category" required defaultValue="" className={`${fieldClass} mt-1`}>
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium" htmlFor="price">
          Price *
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0.00"
            className={`${fieldClass} mt-1`}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="location">
          Location
          <input
            id="location"
            name="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, State"
            className={`${fieldClass} mt-1`}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="sellerName">
          Seller name
          <input
            id="sellerName"
            name="sellerName"
            value={sellerName}
            onChange={(event) => setSellerName(event.target.value)}
            placeholder="Wei Gu"
            className={`${fieldClass} mt-1`}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="sellerEmail">
          Contact email *
          <input
            id="sellerEmail"
            name="sellerEmail"
            type="email"
            required
            value={sellerEmail}
            onChange={(event) => setSellerEmail(event.target.value)}
            placeholder="your@email.com"
            className={`${fieldClass} mt-1`}
          />
        </label>

        <label className="block text-sm font-medium" htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe your item..."
            className={`${fieldClass} mt-1`}
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-fb px-5 py-2.5 font-semibold text-white hover:bg-[#166fe0] disabled:opacity-60"
        >
          {pending ? "Publishing..." : "Create listing"}
        </button>
      </div>

      <aside className="rounded-2xl bg-white p-4">
        <h2 className="mb-4 text-center text-2xl font-extrabold">Preview</h2>
        <ListingPhoto
          src={preview}
          alt={title || "Listing preview"}
          className="aspect-[4/3] w-full"
        />
        <h3 className="mt-4 text-2xl font-extrabold">{title || "Title"}</h3>
        <p className="text-xl font-extrabold">{priceLabel}</p>
        <p className="mt-3 text-sm text-neutral-700">
          Listed just now
          <br />
          in {location || "Palo Alto, CA"}
        </p>
        <h4 className="mt-5 font-extrabold">Seller Information</h4>
        <p className="mt-1 text-sm">{sellerName || sellerEmail || "Seller"}</p>
      </aside>
    </form>
  )
}
