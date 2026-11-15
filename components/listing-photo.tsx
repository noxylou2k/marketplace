import Image from "next/image"

export function ListingPhoto({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 50vw, 20vw",
  priority = false,
}: {
  src: string | null
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}) {
  const inlinePreview = src?.startsWith("blob:") || src?.startsWith("data:")

  return (
    <div className={`relative overflow-hidden rounded-[1.25rem] border-[3px] border-neutral-900 ${className}`}>
      {src && inlinePreview ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${src}")` }}
          role="img"
          aria-label={alt}
        />
      ) : src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="photo-placeholder absolute inset-0" role="img" aria-label={alt} />
      )}
    </div>
  )
}
