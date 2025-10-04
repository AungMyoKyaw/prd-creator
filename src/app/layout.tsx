import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: 'AI PRD Creator',
  description:
    'Turn your ideas into professional Product Requirements Documents instantly with AI',
  applicationName: 'AI PRD Creator',
  keywords: [
    'PRD',
    'Product Requirements Document',
    'AI',
    'Product Management',
    'Documentation'
  ],
  authors: [{ name: 'PRD Creator Team' }],
  creator: 'PRD Creator',
  publisher: 'PRD Creator',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI PRD Creator',
    startupImage: [
      {
        url: '/apple-touch-icon.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)'
      }
    ]
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  openGraph: {
    type: 'website',
    title: 'AI PRD Creator - Generate Professional PRDs Instantly',
    description:
      'Transform your product ideas into comprehensive Product Requirements Documents in minutes with AI-powered assistance. Perfect for product managers, startups, and development teams.',
    url: '/',
    siteName: 'AI PRD Creator',
    images: [
      {
        url: '/og-image-professional.png',
        width: 1200,
        height: 627,
        alt: 'AI PRD Creator - Generate Professional PRDs Instantly'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI PRD Creator - Generate Professional PRDs Instantly',
    description:
      'Transform your product ideas into comprehensive Product Requirements Documents in minutes with AI-powered assistance. Perfect for product managers, startups, and development teams.',
    images: ['/og-image-professional.png']
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
