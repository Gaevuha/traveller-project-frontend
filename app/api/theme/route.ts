// app/api/theme/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Проксі запит до бекенду
    const response = await fetch(`${BACKEND_URL}/api/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    // Копіюємо кукі з бекенду
    const cookies = response.headers.getSetCookie();
    if (cookies) {
      const nextResponse = NextResponse.json(data);
      cookies.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
      return nextResponse;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying theme request:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to save theme',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Проксі GET запит до бекенду
    const response = await fetch(`${BACKEND_URL}/api/theme`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('Cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Копіюємо кукі
    const cookies = response.headers.getSetCookie();
    if (cookies) {
      const nextResponse = NextResponse.json(data);
      cookies.forEach(cookie => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
      return nextResponse;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying theme GET request:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to get theme',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
