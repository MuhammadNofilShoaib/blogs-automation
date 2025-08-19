import { NextResponse } from 'next/server';

export async function GET() {
  // Predefined title and topic for daily blog
  const title = 'Daily Blog';
  const topic = 'Technology';

  await fetch('https://blogs-automation.vercel.app/api/generate-blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, topic }),
  });

  return NextResponse.json({ success: true, message: 'Daily blog generated!' });
}
