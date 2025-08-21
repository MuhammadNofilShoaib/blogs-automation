import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET!,
  apiVersion: "2023-10-01",
  useCdn: true,
});

export async function GET() {
  try {
    const blogs = await sanity.fetch(
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
