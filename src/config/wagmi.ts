import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet
} from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const chains = [
  mainnet,
] as const;

export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || '0xAcademy',
  projectId,
  chains,
  ssr: false,
});
