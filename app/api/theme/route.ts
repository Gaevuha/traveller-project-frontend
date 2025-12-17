// app/api/theme/route.ts (Next.js 13+)
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

// GET /api/theme
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get('cookie') ?? '';

    console.log('GET /api/theme, cookie:', cookie); // ✅ Лог cookies

    const res = await axios.get(`${BACKEND_URL}/api/theme`, {
      headers: { Cookie: cookie },
      withCredentials: true,
    });
    console.log('GET /api/theme response:', res.data); // ✅ Лог відповіді від бекенду
    return NextResponse.json(res.data);
  } catch (e) {
    console.error('❌ GET /api/theme error:', e); // ✅ Лог повної помилки
    return NextResponse.json(
      { message: 'Failed to get theme' },
      { status: 500 }
    );
  }
}

// POST /api/theme
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookie = req.headers.get('cookie') ?? '';
    console.log('POST /api/theme cookie:', cookie); //log

    const res = await axios.post(`${BACKEND_URL}/api/theme`, body, {
      headers: { Cookie: cookie },
      withCredentials: true,
    });
    console.log('POST /api/theme response:', res.data); //log
    return NextResponse.json(res.data);
  } catch (e) {
    console.error('❌ POST /api/theme error:', e); // ✅ Лог повної помилки
    return NextResponse.json(
      { message: 'Failed to save theme' },
      { status: 500 }
    );
  }
}
