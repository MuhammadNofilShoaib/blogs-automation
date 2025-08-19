import { client } from '@/sanity/lib/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { title, topic } = await req.json();

  // Call Gemini API
  const response = await fetch('https://api.gemini.com/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: `Write a detailed blog about "${topic}" with title "${title}".`,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  const content = data.text || data.generated_text;

  // Save to Sanity
  const doc = {
    _type: 'blog',
    title,
    content,
    publishedAt: new Date().toISOString(),
  };

  const savedBlog = await client.create(doc);
  return NextResponse.json(savedBlog);
}
