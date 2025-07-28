import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Suspense } from 'react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
})

export const metadata: Metadata = {
  title: 'CRM System',
  description: 'Customer Relationship Management System',
  keywords: 'CRM, Customer Management, Sales, Leads, Tasks',
  authors: [{ name: 'CRM Team' }],
  robots: 'noindex, nofollow', // Prevent indexing for internal app
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to API server */}
        <link rel="preconnect" href="http://localhost:8000" />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        {/* Optimize resource loading */}
        <link rel="preload" href="/favicon.ico" as="image" />
      </head>
      <body className={inter.className}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}