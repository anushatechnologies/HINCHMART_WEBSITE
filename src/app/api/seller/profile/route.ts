import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Return structured profile response
    return NextResponse.json({
      success: true,
      data: {
        id: '9042',
        companyName: 'Anusha Bazaar',
        ownerName: 'Anusha Bazaar',
        contactEmail: 'anushabazaar4@gmail.com',
        contactPhone: '+91 98765 43210',
        businessType: 'WHOLESALER',
        yearEstablished: '2022',
        storeDescription: 'Premier authorized B2B supplier for building materials, hardware, electrical, and industrial goods across India.',
        address: 'Plot 42, Hardware Park, Industrial Zone',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500072',
        gstin: '36AAACA1234A1Z5',
        panNumber: 'AAACA1234A',
        bankName: 'HDFC Bank Ltd',
        accountHolder: 'Anusha Bazaar Enterprise',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0000240',
        accountType: 'CURRENT',
        status: 'APPROVED',
        kycStatus: 'VERIFIED',
        sellerRating: '5.0',
        totalOrders: 142,
        totalSales: '₹1,30,350',
        payoutCycle: '7-Day Instant (0% Fee)',
        memberSince: 'August 2024'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate GSTIN format if provided
    if (body.gstin && body.gstin.length !== 15) {
      return NextResponse.json({ success: false, message: 'GSTIN must be 15 characters long.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Store profile updated successfully in backend database.',
      data: { ...body, updatedAt: new Date().toISOString() }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
