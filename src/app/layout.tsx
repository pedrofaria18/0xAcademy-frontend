import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ClientProviders } from '@/components/client-providers';
import { Toaster } from 'react-hot-toast';

// Font optimization with display swap for better CLS
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Viewport configuration (Next.js 16 best practice)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// Complete metadata with SEO optimization
export const metadata: Metadata = {
  title: {
    default: '0xAcademy',
    template: '%s | 0xAcademy',
  },
  description: 'Plataforma de cursos descentralizada sobre Web3, Blockchain e Criptomoedas',
  keywords: ['web3', 'blockchain', 'crypto', 'cursos', 'educação', 'ethereum', 'defi'],
  authors: [{ name: '0xAcademy' }],
  creator: '0xAcademy',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    title: '0xAcademy',
    description: 'Plataforma de cursos descentralizada sobre Web3, Blockchain e Criptomoedas',
    siteName: '0xAcademy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '0xAcademy',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: '0xAcademy',
    description: 'Plataforma de cursos descentralizada sobre Web3, Blockchain e Criptomoedas',
    images: ['/og-image.png'],
    creator: '@0xAcademy',
  },

  // Icons and Manifest
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>

        {/* Toaster outside ClientProviders - doesn't need Web3 context */}
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            className: 'bg-background text-foreground border border-border',
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'hsl(var(--destructive-foreground))',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
