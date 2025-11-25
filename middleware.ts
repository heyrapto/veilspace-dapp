import { paymentMiddleware } from 'x402-next';
import { facilitator } from "@coinbase/x402";
import { NextRequest, NextResponse } from 'next/server';

// Dynamic pricing: reads amount from query parameter
// The amount should be passed as ?amount=X.XX (without $ sign)
// Falls back to $1.00 if no amount is provided
const createDynamicMiddleware = () => {
  return async (request: NextRequest): Promise<NextResponse> => {
    const url = new URL(request.url);
    const amountParam = url.searchParams.get('amount');
    
    // Parse and format the amount
    let price = '$1.00'; // Default
    if (amountParam) {
      const amount = parseFloat(amountParam);
      if (!isNaN(amount) && amount > 0) {
        price = `$${amount.toFixed(2)}`;
      }
    }
    
    // Create middleware with dynamic price
    const dynamicMiddleware = paymentMiddleware(
      "0xdb50478626ad025cdb62d8cb764796d7cab23443", // To wallet address
      {
        '/api/payment': {
          price, // Dynamic price based on query parameter
          network: "base-sepolia", // base mainnet
          config: {
            description: 'USDC payment on Ethereum',
          }
        },
      },
      facilitator // CDP mainnet facilitator
    );
    
    // Call the middleware with the request
    return dynamicMiddleware(request);
  };
};

export const middleware = createDynamicMiddleware();

export const config = {
  matcher: ['/api/payment/:path*']
};