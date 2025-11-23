import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

/**
 * Wagmi Configuration for Web3 Integration
 *
 * @see https://wagmi.sh/react/getting-started
 * @see https://www.rainbowkit.com/docs/installation
 */

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID not set. ' +
    'Get one at https://cloud.walletconnect.com'
  );
}

/**
 * Supported blockchain networks
 * Add testnets for development:
 * - sepolia (Ethereum testnet)
 * - polygonMumbai, optimismGoerli, etc.
 */
export const chains = [
  mainnet,
  // Uncomment for testnet support:
  // ...(process.env.NODE_ENV === 'development' ? [sepolia] : []),
] as const;

/**
 * Wagmi config with RainbowKit defaults
 *
 * @important ssr: false prevents hydration mismatches from wallet extensions
 * that inject into window/document during page load
 */
export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || '0xAcademy',
  projectId,
  chains,
  ssr: false, // Critical for Next.js App Router
});
