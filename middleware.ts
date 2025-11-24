import { paymentMiddleware } from 'x402-next';
import { facilitator } from "@coinbase/x402";

export const middleware = paymentMiddleware(
  "0xdb50478626ad025cdb62d8cb764796d7cab23443", // To wallet address
  {
    '/api/payment': {
      price: '$1.00', // Amount in USDC
      network: "base-sepolia", // base mainnet
      config: {
        description: 'USDC payment on Ethereum',
      }
    },
  },
  facilitator // CDP mainnet facilitator
);

export const config = {
  matcher: ['/api/payment/:path*']
};