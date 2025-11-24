"use client";

import { PaymentButton } from '@/app/components/payment/PaymentButton';
import { useState } from 'react';

export default function PaymentDemoPage() {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment completed:', data);
    setSuccessMessage(`Payment successful! ${data.message}`);
    setErrorMessage('');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    setErrorMessage(error);
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            X402 Payment Demo
          </h1>
          <p className="text-gray-600 mb-8">
            Test USDC payments on Base using your Wagmi + Viem wallet
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="font-semibold text-blue-900 mb-2">How it works:</h2>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Connect your wallet (make sure you're on Base network)</li>
              <li>Click the payment button</li>
              <li>Sign the payment message in your wallet</li>
              <li>The payment will be processed on-chain</li>
              <li>You'll receive access to the protected content</li>
            </ol>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <PaymentButton
              endpoint="/api/payment"
              amount="$1.00"
              description="Payment for accessing premium content"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>

          {successMessage && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Error: {errorMessage}</p>
            </div>
          )}

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details:</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Amount:</dt>
                <dd className="font-medium text-gray-900">$1.00 USDC</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Network:</dt>
                <dd className="font-medium text-gray-900">Base Mainnet</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Asset:</dt>
                <dd className="font-mono text-xs text-gray-900">
                  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Receiving Wallet:</dt>
                <dd className="font-mono text-xs text-gray-900">
                  0xdb50478626ad025cdb62d8cb764796d7cab23443
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Make sure you have USDC on Base network before attempting payment</p>
            <p className="mt-1">You can bridge USDC to Base using bridge.base.org</p>
          </div>
        </div>
      </div>
    </div>
  );
}
