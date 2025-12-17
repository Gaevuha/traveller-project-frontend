export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { api } from '../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../_utils/utils';

/**
 * GET /api/stories
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const search = request.nextUrl.searchParams.get('search') ?? '';
    const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
    const perPage = Number(request.nextUrl.searchParams.get('perPage') ?? 12);
    const category = request.nextUrl.searchParams.get('category') ?? '';
    const sortBy = request.nextUrl.searchParams.get('sortBy') ?? '';

    const res = await api('/stories', {
      params: {
        ...(search !== '' && { search }),
        page,
        perPage,
        ...(category && category !== 'All' && { category }),
        ...(sortBy && { sortBy }),
      },
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.status }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stories
 */
export async function POST(request: NextRequest) {
  try {
    // 🔹 АВЕРТ cookies()
    const cookieStore = await cookies();

    // 🔹 Якщо тобі потрібен заголовок Cookie для axios
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');

    console.log('🍪 Cookies header:', cookieHeader || 'NO COOKIES');

    const formData = await request.formData();

    const remoteFormData = new FormData();
    formData.forEach((value, key) => {
      remoteFormData.append(key, value);
    });

    const res = await api.post('/stories', remoteFormData, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log('✅ Story created:', res.data);

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('🟡 Axios Error:', error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    console.error('❌ Unknown Error:', (error as Error).message);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
