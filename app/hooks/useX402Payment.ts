"use client";

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { type WalletClient, type Hex, getAddress } from 'viem';

interface PaymentInstructions {
  x402Version: number;
  error: string;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    payTo: string;
    asset: string;
    maxTimeoutSeconds: number;
    extra?: {
      name?: string;
      version?: string;
    };
  }>;
}

interface UseX402PaymentReturn {
  makePayment: (endpoint: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
  paymentData: any | null;
}

export function useX402Payment(): UseX402PaymentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any | null>(null);

  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();

  const makePayment = async (endpoint: string): Promise<any> => {
    setIsLoading(true);
    setError(null);
    setPaymentData(null);

    try {
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      if (!chain) {
        throw new Error('Chain not detected');
      }

      // Step 1: Get payment instructions (402 response)
      console.log('Fetching payment instructions...');
      const instructionsResponse = await fetch(endpoint);

      if (instructionsResponse.status !== 402) {
        throw new Error(`Expected 402 status, got ${instructionsResponse.status}`);
      }

      const instructions: PaymentInstructions = await instructionsResponse.json();
      console.log('Payment instructions:', instructions);

      const paymentInfo = instructions.accepts[0];

      // Step 2: Create payment payload using EIP-3009 TransferWithAuthorization
      const paymentPayload = await createPaymentPayload(
        walletClient,
        address,
        paymentInfo,
        chain.id
      );

      console.log('Payment payload created:', paymentPayload);

      // Step 3: Encode payment payload as base64
      const paymentJson = JSON.stringify(paymentPayload);
      console.log('Payment JSON before encoding:', paymentJson);
      const paymentBase64 = btoa(paymentJson);
      console.log('Payment Base64:', paymentBase64);

      // Step 4: Make the request with payment proof
      const paidResponse = await fetch(endpoint, {
        headers: {
          'X-PAYMENT': paymentBase64,
          'Content-Type': 'application/json',
        },
      });

      if (!paidResponse.ok) {
        const errorText = await paidResponse.text();
        throw new Error(`Payment failed: ${errorText}`);
      }

      const data = await paidResponse.json();
      console.log('Payment successful:', data);

      setPaymentData(data);
      setIsLoading(false);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Payment error:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    makePayment,
    isLoading,
    error,
    paymentData,
  };
}

// Generate a random nonce for EIP-3009
function generateNonce(): Hex {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex;
}

async function createPaymentPayload(
  walletClient: WalletClient,
  from: string,
  paymentInfo: PaymentInstructions['accepts'][0],
  chainId: number
) {
  const account = walletClient.account;
  if (!account) {
    throw new Error('No account found in wallet client');
  }

  // Current time and expiry (5 minutes from now)
  const now = Math.floor(Date.now() / 1000);
  const validAfter = now.toString();
  const validBefore = (now + 300).toString(); // 5 minutes

  // Generate random nonce
  const nonce = generateNonce();

  // EIP-3009 TransferWithAuthorization domain and types
  // Use name and version from the extra field in payment requirements
  const domain = {
    name: paymentInfo.extra?.name || 'USD Coin',
    version: paymentInfo.extra?.version || '2',
    chainId,
    verifyingContract: paymentInfo.asset as `0x${string}`,
  };

  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };

  const authorization = {
    from: getAddress(from),
    to: getAddress(paymentInfo.payTo),
    value: paymentInfo.maxAmountRequired,
    validAfter,
    validBefore,
    nonce,
  };

  console.log('Signing authorization:', authorization);
  console.log('Domain:', domain);
  console.log('Chain ID:', chainId);

  // Sign using EIP-712
  const signature = await walletClient.signTypedData({
    account,
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
    message: authorization,
  });

  console.log('Signature:', signature);

  // Return the x402 payment payload
  return {
    x402Version: 1,
    scheme: 'exact',
    network: paymentInfo.network,
    payload: {
      signature,
      authorization,
    },
  };
}
