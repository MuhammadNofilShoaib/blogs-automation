// app/api/generate-blog/route.ts
import type { NextRequest } from "next/server";
import { createClient } from "@sanity/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ======= Sanity Setup =======
const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: "2023-10-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// ======= Google Gemini Setup =======
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ======= Types =======
interface BlogSection {
  heading: string;
  text: string;
}

interface GeneratedBlog {
  title: string;
  sections: BlogSection[];
  tags: string[];
}

interface PortableTextChild {
  _type: "span";
  text: string;
  marks: string[];
}

interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: string;
  markDefs: unknown[];
  children: PortableTextChild[];
}

// ======= Helpers =======
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 96);

// ======= Main Handler =======
export async function GET(req: NextRequest) {
  try {
    // 🔒 Secret check (only in production)
    if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
      const provided = req.headers.get("x-cron-secret");
      if (provided !== process.env.CRON_SECRET) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    // ====== Step 1: Generate blog JSON with Gemini ======
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Generate a blog post in JSON format. 
Fields:
- title (catchy, clear)
- sections (array of 4–5 items). Each has:
  - heading
  - text (2–3 paragraphs, general audience)
- tags (3–5 SEO tags)

Return ONLY JSON. Example:
{
  "title": "My Blog Title",
  "sections": [
    {"heading": "Intro", "text": "paragraphs..."},
    {"heading": "Another", "text": "...."}
  ],
  "tags": ["seo","marketing"]
}
`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // 🛠 Extract JSON safely
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No valid JSON found in model response: " + raw);
    }

    const blog: GeneratedBlog = JSON.parse(match[0]);

    // ====== Step 2: Build portable text body with _key ======
    const body: PortableTextBlock[] = [];
    for (const sec of blog.sections) {
      body.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "h2",
        markDefs: [],
        children: [{ _type: "span", text: sec.heading, marks: [] }],
      });
      body.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", text: sec.text, marks: [] }],
      });
    }

    // ====== Step 3: Upload to Sanity ======
    const slug = slugify(blog.title);
    const doc = await sanity.create({
      _type: "post",
      title: blog.title,
      slug: { _type: "slug", current: slug },
      body,
      tags: blog.tags || [],
      publishedAt: new Date().toISOString(),
    });

    return Response.json({ ok: true, id: doc._id, slug, title: blog.title });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    }
    console.error("❌ Blog generation failed:", message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500 }
    );
  }
}

// Support POST method as GET
export const POST = GET;
