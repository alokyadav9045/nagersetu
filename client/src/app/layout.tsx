import { Inter } from 'next/font/google'
import './globals.css'
import AppFrame from '@/components/layout/AppFrame'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  )
}
