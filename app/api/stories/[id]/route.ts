import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../api';
import { cookies } from 'next/headers';
import { isAxiosError } from 'axios';
import { logErrorResponse } from '../../_utils/utils';

type StoryRouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/stories/[id]
 */
export async function GET(request: NextRequest, { params }: StoryRouteParams) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;

    // Формуємо заголовок Cookie для axios
    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    console.log('🍪 Cookies header:', cookieHeader || 'NO COOKIES');

    const res = await api.get(`/stories/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
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
 * PATCH /api/stories/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: StoryRouteParams
) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;

    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    console.log('🟡 PATCH cookies:', cookieHeader || 'NO COOKIES');

    const formData = await request.formData();
    const remoteFormData = new FormData();
    formData.forEach((value, key) => {
      remoteFormData.append(key, value);
    });

    const res = await api.patch(`/stories/${id}`, remoteFormData, {
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Story updated:', res.data);

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
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
 * DELETE /api/stories/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: StoryRouteParams
) {
  try {
    const cookieStore = await cookies();
    const { id } = await params;

    const cookieHeader = cookieStore
      .getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    console.log('🟡 NEXT DELETE start', {
      storyId: id,
      cookies: cookieHeader || 'NO COOKIES',
    });

    const res = await api.delete(`/stories/${id}`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    console.log('🟢 DELETE SUCCESS', res.status);

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }
    logErrorResponse({ message: (error as Error).message });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
