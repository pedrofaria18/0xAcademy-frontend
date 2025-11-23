'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import Providers with ssr disabled to avoid indexedDB issues
const Providers = dynamic(
  () => import('@/components/providers').then((mod) => mod.Providers),
  { ssr: false }
);

export function ClientProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
