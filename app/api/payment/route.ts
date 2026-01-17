import { NextRequest, NextResponse } from 'next/server';
import { withX402 } from 'x402-next';
import { facilitator } from '@coinbase/x402';

const PAY_TO_ADDRESS = '0xdb50478626ad025cdb62d8cb764796d7cab23443';
const NETWORK = 'base-sepolia';
const DEFAULT_PRICE = 1.0;
const PAYMENT_DESCRIPTION = 'USDC payment on Ethereum';

const getPriceString = (request: NextRequest): string => {
  const { searchParams } = new URL(request.url);
  const amountParam = searchParams.get('amount');
  const parsed = amountParam ? parseFloat(amountParam) : DEFAULT_PRICE;
  const normalized = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRICE;
  return `$${normalized.toFixed(2)}`;
};

const wrapWithX402 = (
  handler: (request: NextRequest) => Promise<NextResponse>,
) => {
  return async (request: NextRequest) => {
    const price = getPriceString(request);
    const protectedHandler = withX402(
      handler,
      PAY_TO_ADDRESS,
      {
        price,
        network: NETWORK,
        config: {
          description: PAYMENT_DESCRIPTION,
        },
      },
      facilitator,
    );

    return protectedHandler(request);
  };
};

const getHandler = async (request: NextRequest) => {
  const price = getPriceString(request);

  return NextResponse.json({
    success: true,
    message: 'Payment received successfully!',
    data: {
      timestamp: new Date().toISOString(),
      amount: price,
    },
  });
};

const postHandler = async (request: NextRequest) => {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    message: 'Payment received successfully!',
    receivedData: body,
    timestamp: new Date().toISOString(),
  });
};

export const GET = wrapWithX402(getHandler);
export const POST = wrapWithX402(postHandler);