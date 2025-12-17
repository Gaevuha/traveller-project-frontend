import { NextRequest, NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { api } from '../../../../api';

const COOKIE_NAMES = ['refreshToken', 'sessionId', 'accessToken'];

async function buildCookieHeader() {
  // 🔥 обов'язково await
  const cookieStore = await import('next/headers').then(m => m.cookies());
  const cookiePairs: string[] = [];

  COOKIE_NAMES.forEach(name => {
    const cookie = cookieStore.get(name);
    if (cookie?.value) {
      cookiePairs.push(`${name}=${cookie.value}`);
    }
  });

  return cookiePairs.join('; ');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;
    const cookieHeader = await buildCookieHeader();

    const res = await api.post(`/users/me/saved/${storyId}`, null, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message, backend: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;
    const cookieHeader = await buildCookieHeader();

    const res = await api.delete(`/users/me/saved/${storyId}`, {
      headers: { Cookie: cookieHeader },
      withCredentials: true,
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.message, backend: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
