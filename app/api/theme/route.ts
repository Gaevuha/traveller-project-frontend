// app/api/theme/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

/**
 * GET /api/theme
 * Отримати тему користувача з бекенду
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await axios.get(`${BACKEND_URL}/api/theme`, {
      headers: {
        Cookie: cookieHeader, // передаємо cookies для авторизації
      },
      withCredentials: true,
    });

    const nextResponse = NextResponse.json(response.data);

    // Проксі всі Set-Cookie з бекенду назад у браузер
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      setCookie.forEach((cookie: string) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    }

    return nextResponse;
  } catch (error: unknown) {
    console.error('GET /api/theme proxy error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to get theme',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/theme
 * Зберегти тему користувача
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await axios.post(`${BACKEND_URL}/api/theme`, body, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      withCredentials: true,
    });

    const nextResponse = NextResponse.json(response.data);

    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      setCookie.forEach((cookie: string) => {
        nextResponse.headers.append('Set-Cookie', cookie);
      });
    }

    return nextResponse;
  } catch (error: unknown) {
    console.error('POST /api/theme proxy error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to save theme',
      },
      { status: 500 }
    );
  }
}
