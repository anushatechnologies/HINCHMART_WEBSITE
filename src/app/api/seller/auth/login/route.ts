import { NextResponse } from 'next/server';
import { proxySellerAuthRequest } from '../lib';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      ...body,
      email: body.email || body.contactEmail,
      password: body.password
    };

    return proxySellerAuthRequest('/vendors/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Seller login failed' }, { status: 500 });
  }
}
