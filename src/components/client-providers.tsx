'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

/**
 * Client-side Providers Wrapper
 *
 * Dynamically imports Web3 providers with SSR disabled to prevent:
 * - IndexedDB access errors during SSR
 * - Wallet extension conflicts with hydration
 * - LocalStorage access before mount
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
 */
const Providers = dynamic(
  () => import('@/components/providers').then((mod) => mod.Providers),
  {
    ssr: false,
    loading: () => null, // No loading UI to prevent layout shift
  }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
