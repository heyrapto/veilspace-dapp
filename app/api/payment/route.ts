import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // This runs AFTER the middleware validates payment
  return NextResponse.json({ 
    success: true,
    message: "Payment received successfully!",
    data: {
      timestamp: new Date().toISOString(),
      // Add whatever data you want to return after payment
    }
  });
}

// Optional: Also handle POST if needed
export async function POST(request: Request) {
  const body = await request.json();
  
  return NextResponse.json({ 
    success: true,
    message: "Payment received successfully!",
    receivedData: body,
    timestamp: new Date().toISOString()
  });
}