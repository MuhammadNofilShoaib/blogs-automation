// app/api/generate-blog/route.ts
import type { NextRequest } from "next/server";
import { createClient } from "@sanity/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import fs from "fs";
import path from "path";


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

// Upload a default image
// Path to your default image
const imagePath = path.join(process.cwd(), "public", "blog.jpg");

// Read the file into a buffer
const fileBuffer = fs.readFileSync(imagePath);

// Upload to Sanity
const uploadedImage = await sanity.assets.upload("image", fileBuffer, {
  filename: "default-blog.jpg",
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
  skillType?: "copywriter" | "audio" | "tutor";
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

    //     const prompt = `
    // Generate a blog post in JSON format.
    // Fields:
    // - title (catchy, clear)
    // - skillType ("copywriter", "audio", or "tutor")
    // - sections (array of 4–5 items). Each has:
    //   - heading
    //   - text (2–3 paragraphs, general audience)
    // - tags (3–5 SEO tags)

    // Return ONLY JSON. Example:
    // {
    //   "title": "My Blog Title",
    //   "skillType": "copywriter",
    //   "sections": [
    //     {"heading": "Intro", "text": "paragraphs..."},
    //     {"heading": "Another", "text": "...."}
    //   ],
    //   "tags": ["seo","marketing"]
    // }
    // `;


    const prompt = `
      You are a blog writer who writes in the style of Kane "Jacob Frost"—conversational, clear, and engaging. 
      Mimic his voice and tone: use emojis for headings, rhetorical questions, casual phrases, and a mix of psychology + practical advice. 
      Make the blog sound human, approachable, and slightly playful, while still being authoritative.

      Generate a blog post in JSON format.
      Fields:
      - title (catchy, clear, curiosity-driven)
      - skillType ("copywriter", "audio", or "tutor")
      - sections (array of 4–6 items). Each has:
        - heading (may include emojis to add style)
        - text (2–4 short paragraphs, conversational, scannable, and engaging. Use examples, ❌ vs ✅ comparisons, and practical tips where helpful.)
      - tags (3–6 SEO-friendly tags)
      - cta (a friendly but persuasive call-to-action at the end, offering either free help, an email, or a call)

      Return ONLY JSON. Example:
      {
        "title": "Why Most Website Copy Fails (And How to Fix It in 2025)",
        "skillType": "copywriter",
        "sections": [
          {"heading": "🎯 Why Copy Matters", "text": "paragraphs..."},
          {"heading": "🧠 Psychology First", "text": "paragraphs..."},
          {"heading": "✅ Features vs Benefits", "text": "paragraphs..."},
          {"heading": "💬 Human, Not Corporate", "text": "paragraphs..."},
          {"heading": "🚀 Final Words", "text": "wrap-up..."}
        ],
        "tags": ["copywriting","marketing","website","conversion","psychology"],
        "cta": "👉🏽 Ready to upgrade your copy? DM me or email kane@jacobfrost.com.au for a free discovery chat."
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

    // ====== Step 2: Build portable text content ======
    const content: PortableTextBlock[] = [];
    for (const sec of blog.sections) {
      content.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "h2",
        markDefs: [],
        children: [{ _type: "span", text: sec.heading, marks: [] }],
      });
      content.push({
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
      _type: "blogPost",
      title: blog.title,
      slug: { _type: "slug", current: slug },
      skillType: blog.skillType || "copywriter",
      mainImage: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: uploadedImage._id,
        },
      },
      content,
      publishedAt: new Date().toISOString(),
      // mainImage is optional, omit it if not provided
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
