// app/api/users/[id]/route.ts - використовуйте той самий підхід
import { NextResponse, NextRequest } from 'next/server';
import { api, ApiError } from '../../api'; // той самий api instance

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('perPage') || '6';

  try {
    const { data } = await api.get(`/users/${id}`, {
      params: { page, perPage },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          (error as ApiError).response?.data?.error ??
          (error as ApiError).message,
      },
      { status: (error as ApiError).status || 500 }
    );
  }
}
