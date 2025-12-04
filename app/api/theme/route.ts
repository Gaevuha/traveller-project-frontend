// app/api/theme/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Отримуємо всі cookies з запиту
    const cookieHeader = request.headers.get('cookie') || '';

    // Проксі запит до бекенду
    const response = await fetch(`${BACKEND_URL}/api/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader, // Передаємо всі cookies
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Копіюємо всі cookies з відповіді бекенду
    const nextResponse = NextResponse.json(data);
    const setCookieHeaders = response.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach(cookie => {
        // Обробка cookie для Next.js
        const [cookiePart] = cookie.split(';');
        const [name, value] = cookiePart.split('=');

        nextResponse.cookies.set({
          name,
          value,
          httpOnly: cookie.includes('HttpOnly'),
          secure: cookie.includes('Secure'),
          sameSite: cookie.includes('SameSite=None') ? 'none' : 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 днів
          path: '/',
        });
      });
    }

    return nextResponse;
  } catch (error) {
    console.error('Помилка проксі теми:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to save theme',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
