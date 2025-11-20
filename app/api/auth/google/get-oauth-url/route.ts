import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

if (!BACKEND_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export async function GET(req: NextRequest) {
  try {
    // Проксируем запрос на бекенд
    const backendRes = await fetch(
      `${BACKEND_URL}/api/auth/google/get-oauth-url`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // если бекенд смотрит на куки – прокинем их
          cookie: req.headers.get('cookie') ?? '',
        },
        // если у вас бекенд и фронт на одном домене — можно не указывать credentials
      }
    );

    const data = await backendRes.json();

    const response = NextResponse.json(data, {
      status: backendRes.status,
    });

    // Если вдруг бекенд ставит куки на этом шаге — пробросим
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }

    return response;
  } catch (error) {
    console.error('❌ Error in /api/auth/google/get-oauth-url:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Failed to get Google OAuth URL',
        error: 'Internal error',
      },
      { status: 500 }
    );
  }
}