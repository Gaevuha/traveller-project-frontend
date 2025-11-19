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
export async function GET(
  request: NextRequest,
  { params }: StoryRouteParams
) {
  try {
    const cookieStore = cookies();
    const { id } = await params; 

    const res = await api.get(`/stories/${id}`, {
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = cookies();
    const {id} = await params;
    const formData = await request.formData();

    const remoteFormData = new FormData();
    formData.forEach((value, key) => {
      remoteFormData.append(key, value);
    });

    const res = await api.patch(`/stories/${id}`, remoteFormData, {
      headers: {
        Cookie: cookieStore.toString(),
        'Content-Type': 'multipart/form-data',
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(error.response?.data);
      return NextResponse.json(
        { error: error.message, response: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }

    console.error({ message: (error as Error).message });

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
