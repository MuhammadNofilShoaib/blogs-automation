import { client } from "@/sanity/lib/client";

export async function GET() {
  try {
    const blogs = await client.fetch(
      `*[_type == "post"] | order(publishedAt desc){
        _id,
        title,
        slug,
        body,
        tags,
        publishedAt
      }`
    );

    return new Response(JSON.stringify(blogs), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to fetch blogs:", err);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
