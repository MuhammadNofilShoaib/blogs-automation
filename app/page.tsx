"use client";

import { useEffect, useState } from "react";

interface Blog {
  _id: string;
  title: string;
  slug: { current: string };
  body: { _type: string; style: string; children: { _type: string; text: string }[] }[];
  tags: string[];
  publishedAt: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/get-blogs");
      const data = await res.json();
      setBlogs(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    const interval = setInterval(fetchBlogs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-600 animate-pulse">
          Loading blogs...
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 text-black">
      <h1 className="text-5xl font-extrabold mb-12 text-center text-gradient bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
        Latest Blogs
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="flex flex-col justify-between p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300 bg-white"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2 hover:text-indigo-600 transition-colors">
                {blog.title}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(blog.publishedAt).toLocaleDateString()}{" "}
                {new Date(blog.publishedAt).toLocaleTimeString()}
              </p>

              {blog.body.map((block, idx) => (
                <div
                  key={idx}
                  className={
                    block.style === "h2"
                      ? "text-xl font-semibold mt-4 text-gray-800"
                      : "mt-2 text-gray-700"
                  }
                >
                  {block.children.map((child) => child.text)}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
