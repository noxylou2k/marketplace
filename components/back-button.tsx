"use client"

import { useRouter } from "next/navigation"

export function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
          return
        }
        router.push("/")
      }}
      className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fb hover:underline"
    >
      <span aria-hidden="true">←</span>
      Back
    </button>
  )
}
