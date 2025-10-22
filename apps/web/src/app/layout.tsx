// Root layout for TradoSphere
// Provides global context, theme, and error boundaries

import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'TradoSphere - Trading Signals & Competitions',
  description: 'Share trading signals, compete with traders, and improve your skills',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {/* TODO: Add providers (Jotai, React Query, etc.) */}
        {/* TODO: Add Toaster for notifications */}
        {children}
      </body>
    </html>
  )
}
