import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${backendUrl}/api/auth/google/confirm-oauth`, {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('❌ Proxy error /google/confirm-oauth:', error);
    return NextResponse.json(
      { message: 'Proxy error on Google OAuth confirm' },
      { status: 500 }
    );
  }
}