import { NextResponse } from 'next/server';
import { proxySellerAuthRequest } from '../lib';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = {
      companyName: body.companyName,
      ownerName: body.ownerName || `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.companyName,
      businessType: body.businessType || 'RETAILER',
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      password: body.password,
      gstin: body.gstin,
      panNumber: body.panNumber,
      firebasePhoneToken: body.firebasePhoneToken || 'mock-firebase-phone-token',
      skipVerification: body.skipVerification ?? true
    };

    return proxySellerAuthRequest('/vendors/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Seller registration failed' }, { status: 500 });
  }
}
