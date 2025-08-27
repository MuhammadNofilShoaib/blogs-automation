import { createClient } from "next-sanity"; // or your sanity client import

const client = createClient({
  projectId: "iujs0hr9",
  dataset: "production", // or your dataset
  apiVersion: "2025-08-24",
  useCdn: false,
});

async function deleteAllBlogPosts() {
  const posts = await client.fetch('*[_type == "blogPost"]{_id}');
  for (const post of posts) {
    await client.delete(post._id);
    console.log(`Deleted: ${post._id}`);
  }
  console.log("All blog posts deleted!");
}

deleteAllBlogPosts();
