import type { Metadata } from "next"
import { Heebo } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const heebo = Heebo({ 
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-heebo"
})

export const metadata: Metadata = {
  title: "בית הספר של בנדה למסחר אונליין",
  description: "בנה חנות איביי שמכניסה כסף אמיתי עם ליווי צמוד, לא לבד מול המסך",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

