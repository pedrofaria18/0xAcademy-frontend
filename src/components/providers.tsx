'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'next-themes';
import { wagmiConfig } from '@/config/wagmi';

/**
 * Web3 + UI Providers
 * Handles Wagmi, TanStack Query, RainbowKit, and Theme configuration
 *
 * @important QueryClient must be instantiated inside component to avoid
 * sharing state between requests in SSR (Next.js App Router requirement)
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient inside component to avoid SSR issues
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Prevent hydration mismatch from wallet extensions
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {mounted ? (
            <RainbowKitProvider
              coolMode
              theme={{
                lightMode: lightTheme({
                  accentColor: 'hsl(var(--primary))',
                  accentColorForeground: 'hsl(var(--primary-foreground))',
                  borderRadius: 'medium',
                }),
                darkMode: darkTheme({
                  accentColor: 'hsl(var(--primary))',
                  accentColorForeground: 'hsl(var(--primary-foreground))',
                  borderRadius: 'medium',
                }),
              }}
            >
              {children}
            </RainbowKitProvider>
          ) : (
            // Render children without RainbowKit during SSR
            children
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
