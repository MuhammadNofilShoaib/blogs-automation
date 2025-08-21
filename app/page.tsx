"use client";

import { useEffect, useState } from "react";

interface Blog {
  _id: string;
  title: string;
  slug: { current: string };
  skillType: string;
  mainImage?: {
    asset: { _id: string; url: string };
    alt?: string;
  };
  content: {
    _type: string;
    style?: string;
    children?: { _type: string; text: string }[];
    _key: string;
    asset?: { _id: string; url: string };
    alt?: string;
  }[];
  publishedAt: string;
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/get-blogs", { cache: "no-store" });
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
    const interval = setInterval(fetchBlogs, 5000); // optional auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-600 animate-pulse">
            Loading blogs...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-[1440px] mx-auto py-12 text-black">
      <h1 className="text-5xl font-extrabold mb-12 text-center text-gradient bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
        Latest Blogs
      </h1>

      <div className="grid grid-cols-2 gap-8">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="flex flex-col justify-between p-6 border border-gray-400 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300 bg-white/70"
          >
            <div>
              {blog.mainImage?.asset.url && (
                <img
                  src={blog.mainImage.asset.url}
                  // src="/blog.jpg"
                  alt={blog.mainImage.alt || blog.title}
                  className="w-full h-auto object-cover rounded-xl mb-4"
                />
              )}

              <h2 className="text-4xl font-bold mb-2 hover:text-indigo-600 transition-colors duration-500">
                {blog.title}
              </h2>
              <p className="text-sm text-black/50 font-mono mb-4">
                {new Date(blog.publishedAt).toLocaleDateString()}{" "}
                {new Date(blog.publishedAt).toLocaleTimeString()}
              </p>

              {blog.content?.map((block) => (
                <div
                  key={block._key}
                  className={
                    block.style === "h2"
                      ? "text-xl font-semibold mt-4 text-gray-800"
                      : "mt-2 text-gray-700"
                  }
                >
                  {block.children?.map((child) => child.text)}
                  {block.asset?.url && (
                    <img
                      src={block.asset.url}
                      alt={block.alt || ""}
                      className="my-2 rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {blog.skillType}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
