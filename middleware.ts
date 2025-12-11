import { paymentMiddleware } from 'x402-next';
import { facilitator } from "@coinbase/x402";
import { NextRequest, NextResponse } from 'next/server';

const createDynamicMiddleware = () => {
  return async (request: NextRequest): Promise<NextResponse> => {
    const url = new URL(request.url);
    const amountParam = url.searchParams.get('amount');
    
    let price = '$1.00';
    if (amountParam) {
      const amount = parseFloat(amountParam);
      if (!isNaN(amount) && amount > 0) {
        price = `$${amount.toFixed(2)}`;
      }
    }
    
    const dynamicMiddleware = paymentMiddleware(
      "0xdb50478626ad025cdb62d8cb764796d7cab23443", // To wallet address
      {
        '/api/payment': {
          price,
          network: "base", 
          config: {
            description: 'USDC payment on Base',
          }
        },
      },
      facilitator
    );
    
    return dynamicMiddleware(request);
  };
};

export const middleware = createDynamicMiddleware();

export const config = {
  matcher: ['/api/payment/:path*']
};
