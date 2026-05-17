import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GTA 6 Countdown – Vice City Awaits',
  description: 'Live countdown to Grand Theft Auto VI – November 19, 2026',
  openGraph: {
    title: 'GTA 6 Countdown',
    description: 'Live countdown to Grand Theft Auto VI – November 19, 2026',
    images: ['/opengraph.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
