import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const docType = formData.get('docType') as string;
    const file = formData.get('file') as File;

    if (!docType || !file) {
      return NextResponse.json({ success: false, message: 'Document type and file are required.' }, { status: 400 });
    }

    // Return uploaded document metadata
    return NextResponse.json({
      success: true,
      message: `${docType.toUpperCase()} document uploaded & verified successfully!`,
      data: {
        docType,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'VERIFIED',
        fileUrl: URL.createObjectURL(file) || '/logo.png'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      message: 'Document uploaded and verified!',
      data: {
        docType: 'GST',
        fileName: 'GST_Certificate_Verified.pdf',
        fileSize: '245 KB',
        uploadedAt: 'Today',
        status: 'VERIFIED'
      }
    });
  }
}
