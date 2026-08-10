import { NextResponse } from 'next/server';
import { proxySellerAuthRequest } from '../lib';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    return proxySellerAuthRequest('/vendors/link-provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Failed to link provider' }, { status: 500 });
  }
}
