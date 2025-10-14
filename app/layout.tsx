import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { WakeLock } from '@/components/WakeLock'
import { PWAInstaller } from '@/components/PWAInstaller'
import { FullscreenManager } from '@/components/FullscreenManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barbería Elite - Sistema de Gestión',
  description: 'Sistema de gestión para barberías con registro de servicios y pagos',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Barbería Elite',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon-512.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Barbería Elite" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        
        {/* Android Chrome Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Barbería Elite" />
        
        {/* Evitar zoom en inputs */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <WakeLock />
          <PWAInstaller />
          <FullscreenManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}