export function formatPrice(value: number) {
  const digits = Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

export function listedAgo(iso: string) {
  const delta = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.round(delta / 60000))

  if (minutes < 1) return "Listed just now"
  if (minutes < 60) {
    return `Listed ${minutes} minute${minutes === 1 ? "" : "s"} ago`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `Listed ${hours} hour${hours === 1 ? "" : "s"} ago`
  }

  const days = Math.round(hours / 24)
  if (days < 14) {
    return `Listed ${days} day${days === 1 ? "" : "s"} ago`
  }

  return `Listed ${new Date(iso).toLocaleDateString("en-US")}`
}
