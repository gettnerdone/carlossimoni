import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PHOTOS } from '@/content/photos'

// Renders the real photo once content/photos.ts has a `src` for this slot;
// until then, shows a clean placeholder with the aspect ratio already
// correct, so the layout never shifts when a real photo is dropped in.
export function Photo({ id, className, preload }: { id: keyof typeof PHOTOS; className?: string; preload?: boolean }) {
  const slot = PHOTOS[id]

  if (slot.src) {
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
