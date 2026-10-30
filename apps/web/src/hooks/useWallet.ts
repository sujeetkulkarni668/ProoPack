import { useState, useEffect, useCallback, useRef } from 'react';
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

  const announcedProviders = useRef<any[]>([]);

  // Listen for EIP-6963 provider announcements on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAnnouncement = (event: any) => {
      if (event.detail && event.detail.provider) {
        announcedProviders.current.push(event.detail);
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnouncement);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
    };
  }, []);

  /**
   * Discovers the BridgeKey or Web3 provider across all common injection surfaces
   */
  const discoverProvider = useCallback((preferredWallet: 'bridgekey' | 'injected' = 'bridgekey') => {
    if (typeof window === 'undefined') return null;
    const win = window as any;

    if (preferredWallet === 'bridgekey') {
      // 1. Explicit window.bridgekey (lowercase)
      if (win.bridgekey) return win.bridgekey;

      // 2. Explicit window.bridgeKey (camelCase)
      if (win.bridgeKey) return win.bridgeKey;

      // 3. Explicit window.BridgeKey (PascalCase)
      if (win.BridgeKey) return win.BridgeKey;

      // 4. Multi-provider array (e.g. MetaMask + BridgeKey coexisting)
      if (Array.isArray(win.ethereum?.providers)) {
        const bk = win.ethereum.providers.find(
          (p: any) =>
            p.isBridgeKey ||
            p.bridgekey ||
            p.name?.toLowerCase().includes('bridgekey') ||
            p.constructor?.name?.toLowerCase().includes('bridgekey')
        );
        if (bk) return bk;
      }

      // 5. EIP-6963 announced BridgeKey
      if (announcedProviders.current.length > 0) {
        const announced = announcedProviders.current.find(
          (p: any) =>
            p.info?.name?.toLowerCase().includes('bridgekey') ||
            p.info?.rdns?.toLowerCase().includes('bridgekey')
        );
        if (announced) return announced.provider;
      }

      // 6. Direct window.ethereum with isBridgeKey flag
      if (win.ethereum?.isBridgeKey) return win.ethereum;

      // 7. General window.ethereum (BridgeKey acts as standard EVM injected provider)
      if (win.ethereum) return win.ethereum;

      // 8. Legacy web3 provider
      if (win.web3?.currentProvider) return win.web3.currentProvider;
    } else {
      // Injected preferred
      if (win.ethereum) return win.ethereum;
      if (win.bridgekey || win.bridgeKey) return win.bridgekey || win.bridgeKey;
      if (win.web3?.currentProvider) return win.web3.currentProvider;
    }

    return null;
  }, []);

  /**
   * Polls briefly to tolerate asynchronous extension injection delay
   */
  const waitForProvider = useCallback(
    async (preferredWallet: 'bridgekey' | 'injected', timeoutMs = 1000): Promise<any> => {
      const immediate = discoverProvider(preferredWallet);
      if (immediate) return immediate;

      const start = Date.now();
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          const p = discoverProvider(preferredWallet);
          if (p || Date.now() - start >= timeoutMs) {
            clearInterval(interval);
            resolve(p);
          }
        }, 60);
      });
    },
    [discoverProvider]
  );

  const connect = useCallback(
    async (preferredWallet: 'bridgekey' | 'injected' = 'bridgekey') => {
      setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

      const provider = await waitForProvider(preferredWallet, 1000);
      const win = window as any;

      if (!provider) {
        setWallet(prev => ({
          ...prev,
          isConnecting: false,
          error:
            preferredWallet === 'bridgekey'
              ? 'BridgeKey extension not detected. Please install BridgeKey from https://bridgekey.io/ or use a Web3 browser extension.'
              : 'No Web3 wallet extension found in browser.'
        }));
        return false;
      }

      try {
        const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts selected in wallet');
        }

        const hexChain = (await provider.request({ method: 'eth_chainId' })) as string;
        const chainId = parseInt(hexChain, 16);
        const isBridgeKey = !!(
          win.bridgekey ||
          win.bridgeKey ||
          win.BridgeKey ||
          provider.isBridgeKey ||
          provider.bridgekey
        );

        setWallet({
          address: getAddress(accounts[0]),
          chainId,
          isConnected: true,
          isBridgeKey,
          isConnecting: false,
          error: null
        });

        // Event listeners
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

          provider.on('disconnect', () => {
            disconnect();
          });
        }

        return true;
      } catch (err: any) {
        const msg =
          err.code === 4001 || err.message?.includes('User rejected')
            ? 'Connection rejected by user in wallet popup'
            : err.message || 'Failed to connect wallet';
        setWallet(prev => ({ ...prev, isConnecting: false, error: msg }));
        return false;
      }
    },
    [waitForProvider]
  );

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

  const switchChain = useCallback(
    async (targetChainId: number) => {
      const provider = discoverProvider();
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
          // Chain not added to wallet yet — prompt add
          const isMainnet = targetChainId === 4646;
          const isCoral = targetChainId === 54635;

          const chainConfig = isMainnet
            ? {
                chainId: '0x1226',
                chainName: 'MST Mainnet',
                nativeCurrency: { name: 'MST Coin', symbol: 'MSTC', decimals: 18 },
                rpcUrls: ['https://mariorpc.mstblockchain.com'],
                blockExplorerUrls: ['https://mstscan.com']
              }
            : isCoral
            ? {
                chainId: '0xd56b',
                chainName: 'MST Coral Testnet',
                nativeCurrency: { name: 'Testnet MST Coin', symbol: 'tMSTC', decimals: 18 },
                rpcUrls: ['https://coralrpc.mstblockchain.com'],
                blockExplorerUrls: ['https://coral.mstscan.com']
              }
            : {
                chainId: hexChainId,
                chainName: 'MST Testnet',
                nativeCurrency: { name: 'Testnet MST Coin', symbol: 'tMSTC', decimals: 18 },
                rpcUrls: ['https://coralrpc.mstblockchain.com'],
                blockExplorerUrls: ['https://coral.mstscan.com']
              };

          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig]
          });
          setWallet(prev => ({ ...prev, chainId: targetChainId }));
        } else {
          setWallet(prev => ({ ...prev, error: `Failed to switch chain: ${err.message}` }));
        }
      }
    },
    [discoverProvider]
  );

  const signTransfer = useCallback(
    async (
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
      const provider = discoverProvider();
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
    },
    [discoverProvider, wallet.address]
  );

  return {
    ...wallet,
    connect,
    disconnect,
    switchChain,
    signTransfer
  };
}
