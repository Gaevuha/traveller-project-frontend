// app/api/auth/google/confirm-oauth/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

if (!BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { code: string }

    const backendRes = await fetch(
      `${BACKEND_URL}/api/auth/google/confirm-oauth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: req.headers.get('cookie') ?? '',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();

    const response = NextResponse.json(data, {
      status: backendRes.status,
    });

    // Очень важно: пробрасываем Set-Cookie от бекенда,
    // чтобы на фронте установились access/refresh токены
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    return response;
  } catch (error) {
    console.error('❌ Error in /api/auth/google/confirm-oauth:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to confirm Google OAuth',
        error: 'Internal error',
      },
      { status: 500 }
    );
  }
}
