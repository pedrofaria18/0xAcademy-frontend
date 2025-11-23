'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'next-themes';
import { wagmiConfig } from '@/config/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

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
            children
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
