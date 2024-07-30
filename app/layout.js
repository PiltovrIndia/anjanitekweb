import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Anjani Tek',
  description: 'Dealer Management!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{overflowX:'hidden'}}>
      <body className={inter.className}  style={{overflowX:'hidden'}}>{children}</body>
    </html>
  )
}
