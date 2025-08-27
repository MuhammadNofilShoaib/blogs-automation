// import { client } from "@/sanity/lib/client";

// export async function GET() {
//   try {
//     const blogs = await client.fetch(
//       `*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc) {
//   _id,
//   title,
//   slug,
//   skillType,
//   mainImage{
//     asset->{
//       _id,
//       url
//     },
//     alt
//   },
//   content[]{
//     _type,
//     style,
//     children[]{
//       _type,
//       text
//     },
//     _key,
//     // For images inside content array
//     asset->{
//       _id,
//       url
//     },
//     alt
//   },
//   publishedAt
// }
// `
//     );

//     return new Response(JSON.stringify(blogs), {
//       headers: {
//         "Content-Type": "application/json",
//         "Cache-Control": "no-store", // <-- add this
//       },
//     });
//   } catch (err) {
//     console.error("Failed to fetch blogs:", err);
//     return new Response(JSON.stringify([]), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }

