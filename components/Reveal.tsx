import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

// Fades + slides a block in the first time it scrolls into view. Used
// sparingly on a few sections, not every element — a handful of moments
// reads as intentional, applying it everywhere just reads as motion-sickness.
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
        className
      )}
    >
      {children}
    </div>
  )
}
