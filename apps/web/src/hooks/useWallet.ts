import { useState, useEffect, useCallback } from 'react';
import { Address, Hex, getAddress } from 'viem';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isBridgeKey: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isBridgeKey: false,
    isConnecting: false,
    error: null
  });

  const getProvider = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const win = window as any;
    return win.bridgekey || win.ethereum || null;
  }, []);

  const updateNetwork = useCallback(async (provider: any) => {
    try {
      const hexChain = (await provider.request({ method: 'eth_chainId' })) as string;
      const chainId = parseInt(hexChain, 16);
      setWallet(prev => ({ ...prev, chainId }));
    } catch {
      // Ignore
    }
  }, []);

  const connect = useCallback(async (preferredWallet: 'bridgekey' | 'injected' = 'bridgekey') => {
    const win = window as any;
    let provider = preferredWallet === 'bridgekey' ? win.bridgekey || win.ethereum : win.ethereum;

    if (!provider) {
      setWallet(prev => ({
        ...prev,
        error: preferredWallet === 'bridgekey' 
          ? 'BridgeKey Wallet extension not detected. Please install BridgeKey or choose Injected.' 
          : 'No Web3 wallet provider detected in browser.'
      }));
      return false;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected');
      }

      const hexChain = (await provider.request({ method: 'eth_chainId' })) as string;
      const chainId = parseInt(hexChain, 16);
      const isBridgeKey = !!(win.bridgekey || provider.isBridgeKey);

      setWallet({
        address: getAddress(accounts[0]),
        chainId,
        isConnected: true,
        isBridgeKey,
        isConnecting: false,
        error: null
      });

      // Attach event listeners
      if (typeof provider.on === 'function') {
        provider.on('accountsChanged', (newAccounts: string[]) => {
          if (!newAccounts || newAccounts.length === 0) {
            disconnect();
          } else {
            setWallet(prev => ({ ...prev, address: getAddress(newAccounts[0]) }));
          }
        });

        provider.on('chainChanged', (newChainHex: string) => {
          setWallet(prev => ({ ...prev, chainId: parseInt(newChainHex, 16) }));
        });
      }

      return true;
    } catch (err: any) {
      const msg = err.code === 4001 ? 'Connection rejected by user' : err.message || 'Failed to connect wallet';
      setWallet(prev => ({ ...prev, isConnecting: false, error: msg }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      chainId: null,
      isConnected: false,
      isBridgeKey: false,
      isConnecting: false,
      error: null
    });
  }, []);

  const switchChain = useCallback(async (targetChainId: number) => {
    const provider = getProvider();
    if (!provider) return;

    const hexChainId = `0x${targetChainId.toString(16)}`;
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
      setWallet(prev => ({ ...prev, chainId: targetChainId }));
    } catch (err: any) {
      if (err.code === 4902) {
        // Prompt to add MST Testnet or Mainnet
        const isMainnet = targetChainId === 4646;
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: isMainnet ? 'MST Mainnet' : 'MST Testnet',
              nativeCurrency: {
                name: isMainnet ? 'MST Coin' : 'Testnet MST Coin',
                symbol: isMainnet ? 'MSTC' : 'tMSTC',
                decimals: 18
              },
              rpcUrls: [isMainnet ? 'https://mariorpc.mstblockchain.com' : 'https://testnetrpc.mstblockchain.com'],
              blockExplorerUrls: [isMainnet ? 'https://mstscan.com' : 'https://testnet.mstscan.com']
            }
          ]
        });
        setWallet(prev => ({ ...prev, chainId: targetChainId }));
      } else {
        setWallet(prev => ({ ...prev, error: `Failed to switch chain: ${err.message}` }));
      }
    }
  }, [getProvider]);

  const signTransfer = useCallback(async (
    payload: {
      sender: string;
      to: string;
      amount: string;
      fee: string;
      nonce: number;
      validUntil: number;
    },
    targetChainId: number,
    verifyingContract: string
  ): Promise<Hex> => {
    const provider = getProvider();
    if (!provider || !wallet.address) {
      throw new Error('Wallet not connected');
    }

    const domain = {
      name: 'ProofPack L2',
      version: '1.0',
      chainId: targetChainId,
      verifyingContract
    };

    const types = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Transfer: [
        { name: 'sender', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'fee', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'validUntil', type: 'uint256' }
      ]
    };

    const message = {
      sender: getAddress(payload.sender),
      to: getAddress(payload.to),
      amount: payload.amount,
      fee: payload.fee,
      nonce: payload.nonce,
      validUntil: payload.validUntil
    };

    const dataToSign = JSON.stringify({
      types,
      primaryType: 'Transfer',
      domain,
      message
    });

    const sig = (await provider.request({
      method: 'eth_signTypedData_v4',
      params: [wallet.address, dataToSign]
    })) as Hex;

    return sig;
  }, [getProvider, wallet.address]);

  return {
    ...wallet,
    connect,
    disconnect,
    switchChain,
    signTransfer
  };
}
