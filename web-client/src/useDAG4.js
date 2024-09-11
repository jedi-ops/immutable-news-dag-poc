import { useState, useCallback, useEffect } from 'react';
import { dag4 } from '@stardust-collective/dag4';

export function useDAG4() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    connectToNetwork();
  }, []);

  const connectToNetwork = useCallback(async () => {
    try {
      await dag4.account.connect({
        networkVersion: '2.0',
        testnet: true,
        beUrl: 'http://localhost:9000',
        l0Url: 'http://localhost:9000',
        l1Url: 'http://localhost:9010'
      });
      console.log('Connected to network');
    } catch (error) {
      console.error('Error connecting to network:', error);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      const pk = dag4.keyStore.generatePrivateKey();
      await dag4.account.loginPrivateKey(pk);
      const addr = dag4.account.address;
      setAddress(addr);
      setIsConnected(true);
      return { address: addr };
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setAddress('');
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }, []);

  const getBalance = useCallback(async (addr) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    try {
      return await dag4.network.getAddressBalance(addr || address);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }, [isConnected, address]);

  const transferDAG = useCallback(async (toAddress, amount, fee = 0) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    try {
      return await dag4.account.transferDag(toAddress, amount, fee);
    } catch (error) {
      console.error('Error transferring DAG:', error);
      throw error;
    }
  }, [isConnected]);

  const fetchMetagraphInfo = useCallback(async () => {
    try {
      const globalL0Info = await fetch('http://localhost:9000/node/info').then(res => res.json());
      const metagraphL0Info = await fetch('http://localhost:9200/node/info').then(res => res.json());
      const currencyL1Info = await fetch('http://localhost:9300/node/info').then(res => res.json());
      const dataL1Info = await fetch('http://localhost:9400/node/info').then(res => res.json());

      return {
        globalL0: globalL0Info,
        metagraphL0: metagraphL0Info,
        currencyL1: currencyL1Info,
        dataL1: dataL1Info
      };
    } catch (error) {
      console.error('Error fetching metagraph info:', error);
      throw error;
    }
  }, []);

  return {
    isConnected,
    address,
    connect,
    disconnect,
    getBalance,
    transferDAG,
    fetchMetagraphInfo
  };
}