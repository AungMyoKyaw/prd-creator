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
  title:
    'AI PRD Creator - Transform Ideas into Professional Product Requirements',
  description:
    'Turn your product ideas into comprehensive Product Requirements Documents (PRDs) instantly with AI. Create professional documentation that development teams love to work with.',
  keywords: [
    'PRD',
    'Product Requirements Document',
    'AI',
    'Product Management',
    'Documentation',
    'Product Strategy'
  ],
  authors: [{ name: 'PRD Creator Team' }],
  creator: 'PRD Creator',
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
  openGraph: {
    title: 'AI PRD Creator - Professional Product Requirements Documents',
    description:
      'Transform your product ideas into comprehensive PRDs instantly with AI-powered assistance',
    url: '/',
    siteName: 'AI PRD Creator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI PRD Creator - Professional Product Requirements Documents'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI PRD Creator - Professional Product Requirements Documents',
    description:
      'Transform your product ideas into comprehensive PRDs instantly with AI-powered assistance',
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
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 min-h-screen`}
      >
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-cyan-600/10 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
