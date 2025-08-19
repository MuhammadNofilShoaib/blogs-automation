import { client } from '@/sanity/lib/client';
import GenerateBlogForm from './components/GenerateBlogForm';

// Define the Blog type
interface Blog {
  _id: string;
  title: string;
  content: string;
  publishedAt?: string;
}

async function getBlogs(): Promise<Blog[]> {
  const query = `*[_type == "blog"] | order(publishedAt desc)`;
  return await client.fetch(query);
}

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <GenerateBlogForm />
      {blogs.map((blog) => (
        <div key={blog._id} className="mb-8 p-6 border rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
          <p>{blog.content}</p>
        </div>
      ))}
    </div>
  );
}
