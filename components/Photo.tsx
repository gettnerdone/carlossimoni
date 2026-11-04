import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PHOTOS } from '@/content/photos'

// Renders the real photo once content/photos.ts has a `src` for this slot;
// until then, shows a clean placeholder with the aspect ratio already
// correct, so the layout never shifts when a real photo is dropped in.
//
// `fill` is for full-bleed backgrounds (e.g. a hero banner): the image
// covers its positioned parent instead of sizing itself from width/height,
// so the parent needs `position: relative` and an explicit height.
export function Photo({
  id,
  className,
  preload,
  fill,
}: {
  id: keyof typeof PHOTOS
  className?: string
  preload?: boolean
  fill?: boolean
}) {
  const slot = PHOTOS[id]

  if (slot.src) {
    if (fill) {
      return (
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          preload={preload}
          sizes="100vw"
          className={cn('object-cover', className)}
        />
      )
    }
    return (
      <Image
        src={slot.src}
        alt={slot.alt}
        width={slot.width}
        height={slot.height}
        preload={preload}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn('object-cover', className)}
      />
    )
  }

  if (fill) {
    return (
      <div
        role="img"
        aria-label={slot.alt}
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-400 bg-slate-200 text-center text-slate-500',
          className
        )}
      >
        <ImageIcon className="h-10 w-10" strokeWidth={1.5} />
        <span className="max-w-[60%] text-sm font-medium leading-snug">{slot.alt}</span>
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={slot.alt}
      className={cn(
        'flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 bg-slate-100 text-center text-slate-400',
        className
      )}
      style={{ aspectRatio: `${slot.width} / ${slot.height}` }}
    >
      <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
      <span className="max-w-[80%] text-xs font-medium leading-snug">{slot.alt}</span>
    </div>
  )
}
