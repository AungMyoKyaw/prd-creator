import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'PRD Creator - Transform Ideas into Professional Product Requirements',
  description:
    'Design, refine, and ship extraordinary product narratives in minutes with AI-powered PRD generation. Native macOS experience.',
  keywords: [
    'PRD',
    'Product Requirements Document',
    'AI',
    'Product Management',
    'Documentation',
    'Product Strategy',
    'macOS',
    'Progressive Web App'
  ],
  authors: [{ name: 'Aung Myo Kyaw' }],
  creator: 'Aung Myo Kyaw',
  publisher: 'PRD Creator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://prd-creator.vercel.app'
      : 'http://localhost:3000'
  ),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PRD Creator'
  },
  openGraph: {
    title: 'PRD Creator - Professional Product Requirements Documents',
    description:
      'Design, refine, and ship extraordinary product narratives in minutes with AI-powered assistance',
    url: '/',
    siteName: 'PRD Creator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PRD Creator - Professional Product Requirements Documents'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PRD Creator - Professional Product Requirements Documents',
    description:
      'Design, refine, and ship extraordinary product narratives in minutes with AI-powered assistance',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

// Move viewport to its own export as required by Next.js. See generate-viewport docs.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="PRD Creator" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 min-h-screen`}
      >
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-cyan-600/10 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
