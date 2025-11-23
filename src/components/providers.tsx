'use client';

import { ReactNode, useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'next-themes';
import { wagmiConfig } from '@/config/wagmi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitProvider
            theme={{
              lightMode: lightTheme({
                accentColor: '#7c3aed',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              }),
              darkMode: darkTheme({
                accentColor: '#7c3aed',
                accentColorForeground: 'white',
                borderRadius: 'medium',
              }),
            }}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </RainbowKitProvider>
        ) : (
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
