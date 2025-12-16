import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND = process.env.NEXT_PUBLIC_API_URL + '/api/health';

export async function GET() {
  const MAX_RETRIES = 3;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await axios.get(BACKEND, {
        timeout: 10_000,
      });

      return NextResponse.json(res.data, { status: 200 });
    } catch {
      if (i === MAX_RETRIES - 1) {
        return NextResponse.json(
          { status: 'waking-up' },
          { status: 200 } // ❗ НЕ 503
        );
      }

      await new Promise(r => setTimeout(r, 3000));
    }
  }
}
