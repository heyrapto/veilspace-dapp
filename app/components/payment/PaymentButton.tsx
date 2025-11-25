"use client";

import { useX402Payment } from '@/app/hooks/useX402Payment';
import { useAccount } from 'wagmi';
import { Button } from '../ui/button';
import CustomConnectButton from '../ui/custom/connect-button';

interface PaymentButtonProps {
  endpoint?: string;
  amount?: string;
  description?: string;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function PaymentButton({
  endpoint = '/api/payment',
  amount,
  description = 'Make Payment',
  onSuccess,
  onError,
  ...props
}: PaymentButtonProps) {
  const { isConnected } = useAccount();
  const { makePayment, isLoading, error, paymentData } = useX402Payment();

  const handlePayment = async () => {
    try {
      let paymentEndpoint = endpoint;
      if (amount) {
        const numericAmount = amount.replace(/[^0-9.]/g, '');
        if (numericAmount && parseFloat(numericAmount) > 0) {
          const separator = endpoint.includes('?') ? '&' : '?';
          paymentEndpoint = `${endpoint}${separator}amount=${numericAmount}`;
        }
      }
      
      const result = await makePayment(paymentEndpoint);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      onError?.(errorMessage);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-600">Connect your wallet to make a payment</p>
        <CustomConnectButton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? 'Processing Payment...' : `Pay ${amount} USDC`}
      </Button>

      {description && (
        <p className="text-sm text-gray-600 text-center">{description}</p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {paymentData && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600 font-semibold">Payment Successful!</p>
          <pre className="mt-2 text-xs text-gray-600 overflow-auto">
            {JSON.stringify(paymentData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
