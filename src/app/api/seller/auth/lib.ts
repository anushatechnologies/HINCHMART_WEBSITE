import { NextResponse } from 'next/server';

const getBackendBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'https://api.hinchmart.com';
  return configured.replace(/\/$/, '');
};

export const buildBackendUrl = (path: string) => {
  const normalizedPath = path.startsWith('/api/') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  return `${getBackendBaseUrl()}${normalizedPath}`;
};

export async function proxySellerAuthRequest(path: string, init: RequestInit, fallback?: any) {
  const url = buildBackendUrl(path);

  try {
    const response = await fetch(url, init);
    const text = await response.text();

    let payload: any = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { message: text || 'No response body' };
    }

    return NextResponse.json(payload, { status: response.status });
  } catch (error: any) {
    if (fallback) {
      return NextResponse.json(fallback, { status: 200 });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Unable to reach the seller auth backend.',
        error: error?.message || 'Unknown error'
      },
      { status: 502 }
    );
  }
}
