import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export const useWeb3Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();
  const { login, logout, checkAuth, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async () => {
    try {
      if (!isConnected || !address) {
        openConnectModal?.();
        return;
      }

      setIsLoading(true);

      // Get nonce from backend
      const { nonce } = await authAPI.getNonce(address);

      // Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Faca login na 0xAcademy',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      });

      const messageToSign = message.prepareMessage();

      // Sign message with wallet
      const signature = await signMessageAsync({
        message: messageToSign,
      });

      // Verify signature with backend
      const { token, user } = await authAPI.verify(messageToSign, signature);

      // Update auth store
      login(user, token);
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error?.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logout realizado com sucesso');
  };

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
