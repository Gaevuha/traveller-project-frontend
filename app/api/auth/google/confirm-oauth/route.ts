// app/api/auth/google/confirm-oauth/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

if (!BACKEND_URL) {
  console.error('❌ NEXT_PUBLIC_API_URL is not defined');
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    console.log(
      '🔍 Google OAuth proxy called with code:',
      code ? `${code.substring(0, 10)}...` : 'NO CODE'
    );

    if (!code) {
      console.error('❌ No code provided in request body');
      return NextResponse.json(
        {
          status: 400,
          message: 'Code is required',
          data: null,
        },
        { status: 400 }
      );
    }

    console.log(
      `📤 Proxying to backend: ${BACKEND_URL}/api/auth/google/confirm-oauth`
    );

    const backendRes = await fetch(
      `${BACKEND_URL}/api/auth/google/confirm-oauth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: req.headers.get('cookie') ?? '',
        },
        body: JSON.stringify({ code }),
        credentials: 'include', // Додайте це
      }
    );

    console.log(`📥 Backend response status: ${backendRes.status}`);

    const data = await backendRes.json();
    console.log('📦 Backend response data:', data);

    const response = NextResponse.json(data, {
      status: backendRes.status,
    });

    // Копіюємо всі Set-Cookie заголовки
    const setCookieHeaders = backendRes.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      console.log(
        '🍪 Setting cookies from backend:',
        setCookieHeaders.length,
        'cookies'
      );
      setCookieHeaders.forEach(cookie => {
        response.headers.append('Set-Cookie', cookie);
      });
    }

    return response;
  } catch (error) {
    console.error('❌ Error in /api/auth/google/confirm-oauth:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to confirm Google OAuth',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
