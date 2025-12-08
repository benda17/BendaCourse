import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <Image
            src="/icon.png"
            alt="Benda Course Platform"
            fill
            className="object-contain animate-pulse"
            priority
            sizes="64px"
          />
        </div>
        <p className="text-muted-foreground text-sm">טוען...</p>
      </div>
    </div>
  )
}

