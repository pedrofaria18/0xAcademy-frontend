import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ClientProviders } from '@/components/client-providers';
import toast, { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '0xAcademy',
  description: 'Plataforma de cursos descentralizada sobre Web3, Blockchain e Criptomoedas',
  keywords: 'web3, blockchain, crypto, cursos, educação, ethereum, defi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </ClientProviders>
      </body>
    </html>
  );
}
