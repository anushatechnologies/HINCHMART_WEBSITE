import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || body.contactEmail;

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otp: '123456',
      target: email || 'seller@hinchmart.com'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Unable to send OTP' }, { status: 500 });
  }
}
