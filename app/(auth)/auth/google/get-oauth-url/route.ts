import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${backendUrl}/api/auth/google/get-oauth-url`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('❌ Proxy error /google/get-oauth-url:', error);
    return NextResponse.json(
      { message: 'Proxy error while getting Google OAuth URL' },
      { status: 500 }
    );
  }
}