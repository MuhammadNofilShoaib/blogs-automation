// app/api/cron/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await fetch('https://blogs-automation.vercel.app/api/generate-blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Daily Blog', topic: 'Technology' }),
  });

  return NextResponse.json({ success: true, message: 'Daily blog generated!' });
}
