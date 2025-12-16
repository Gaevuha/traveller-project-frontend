import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/health`,
      {
        timeout: 20_000, // ⏱ Render cold start
        // ❗ cookies тут не потрібні
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(res.data, {
      status: res.status,
    });
  } catch (error) {
    return NextResponse.json({ status: 'waking-up' }, { status: 503 });
  }
}
