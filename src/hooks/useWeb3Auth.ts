import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export const useWeb3Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { login, logout, checkAuth, user, isAuthenticated } = useAuthStore();

  const loginPendingRef = useRef(false);

  const performSiweAuth = useCallback(async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      const { nonce } = await authAPI.getNonce(address);

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to 0xAcademy',
        uri: window.location.origin,
        version: '1',
        chainId: chain?.id || 1,
        nonce,
        issuedAt: new Date().toISOString(),
      });

      const messageToSign = message.prepareMessage();

      const signature = await signMessageAsync({
        message: messageToSign,
      });

      const { token, user: authenticatedUser } = await authAPI.verify(
        messageToSign,
        signature
      );

      login(authenticatedUser, token);

      toast.success('Login realizado com sucesso!');
      loginPendingRef.current = false;
    } catch (error) {
      const err = error as { name?: string; message?: string };

      if (err.name === 'UserRejectedRequestError') {
        toast.error('Assinatura cancelada');
        loginPendingRef.current = false;
        return;
      }

      toast.error(err.message || 'Erro ao fazer login');
      loginPendingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [address, chain?.id, signMessageAsync, login]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isConnected && address && loginPendingRef.current && !isAuthenticated) {
      performSiweAuth();
    }
  }, [isConnected, address, isAuthenticated, performSiweAuth]);

  const handleLogin = useCallback(async () => {
    if (!isConnected || !address) {
      loginPendingRef.current = true;
      openConnectModal?.();
      return;
    }

    await performSiweAuth();
  }, [isConnected, address, openConnectModal, performSiweAuth]);

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
