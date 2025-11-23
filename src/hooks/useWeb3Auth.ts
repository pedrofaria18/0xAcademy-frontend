import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

/**
 * Web3 Authentication Hook
 * Handles SIWE (Sign-In with Ethereum) authentication flow
 *
 * @returns Auth state and login/logout handlers
 *
 * @example
 * ```tsx
 * const { isAuthenticated, handleLogin, handleLogout } = useWeb3Auth();
 * <Button onClick={handleLogin}>Login</Button>
 * ```
 */
export const useWeb3Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { login, logout, checkAuth, user, isAuthenticated } = useAuthStore();

  // Track if login was initiated to auto-sign after wallet connection
  const loginPendingRef = useRef(false);

  /**
   * Perform SIWE authentication
   * Separated from handleLogin to be reusable
   */
  const performSiweAuth = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      // Step 1: Get cryptographic nonce from backend
      const { nonce } = await authAPI.getNonce(address);

      // Step 2: Create SIWE message (EIP-4361)
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to 0xAcademy',
        uri: window.location.origin,
        version: '1',
        chainId: chain?.id || 1,
        nonce,
        issuedAt: new Date().toISOString(), // Required for proper SIWE validation
      });

      const messageToSign = message.prepareMessage();

      // Step 3: Sign message with wallet (may throw if user rejects)
      const signature = await signMessageAsync({
        message: messageToSign,
      });

      // Step 4: Verify signature with backend and get JWT
      const { token, user: authenticatedUser } = await authAPI.verify(
        messageToSign,
        signature
      );

      // Step 5: Update auth store (persisted to localStorage)
      login(authenticatedUser, token);

      toast.success('Login realizado com sucesso!');
      loginPendingRef.current = false;
    } catch (error) {
      console.error('Login error:', error);

      // Type-safe error handling
      const err = error as { name?: string; message?: string };

      // User rejected signature
      if (err.name === 'UserRejectedRequestError') {
        toast.error('Assinatura cancelada');
        loginPendingRef.current = false;
        return;
      }

      // Generic error
      toast.error(err.message || 'Erro ao fazer login');
      loginPendingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [address, chain?.id, signMessageAsync, login]);

  // Check auth on mount (only once)
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-trigger SIWE authentication after wallet connection
  useEffect(() => {
    if (isConnected && address && loginPendingRef.current && !isAuthenticated) {
      performSiweAuth();
    }
  }, [isConnected, address, isAuthenticated, performSiweAuth]);

  /**
   * SIWE Login Flow
   * 1. If wallet not connected, open modal and mark login as pending
   * 2. If wallet connected, perform SIWE authentication
   */
  const handleLogin = useCallback(async () => {
    // Step 1: Ensure wallet is connected
    if (!isConnected || !address) {
      loginPendingRef.current = true;
      openConnectModal?.();
      return;
    }

    // Step 2: Perform SIWE authentication
    await performSiweAuth();
  }, [isConnected, address, openConnectModal, performSiweAuth]);

  /**
   * Logout - Clears auth state and calls backend
   */
  const handleLogout = useCallback(async () => {
    await logout();
    toast.success('Logout realizado com sucesso');
  }, [logout]);

  return {
    user,
    address,
    isConnected,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleLogout,
  };
};
