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
    const interval = setInterval(fetchBlogs, 10000); // optional auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="text-xl font-semibold text-gray-400 animate-pulse">
          Loading blogs...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-16 px-6">
      <h1 className="text-5xl font-extrabold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Our Latest Insights
      </h1>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <div
            key={blog._id}
            className="group relative bg-gray-800 rounded-3xl overflow-hidden shadow-xl transform transition-all duration-500 hover:shadow-2xl"
          >
            {/* Image */}
            {blog.mainImage?.asset.url && (
              <div className="overflow-hidden">
                <img
                  src={blog.mainImage.asset.url}
                  alt={blog.mainImage.alt || blog.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
            )}

            {/* Content Overlay */}
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                  {blog.title}
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                  {new Date(blog.publishedAt).toLocaleDateString()}{" "}
                  {new Date(blog.publishedAt).toLocaleTimeString()}
                </p>

                {blog.content.map((block) => (
                  <div
                    key={block._key}
                    className={
                      block.style === "h2"
                        ? "text-xl font-semibold mt-4 text-gray-200"
                        : "mt-2 text-gray-300"
                    }
                  >
                    {block.children?.map((child) => child.text)}
                    {block.asset?.url && (
                      <img
                        src={block.asset.url}
                        alt={block.alt || ""}
                        className="my-2 rounded-lg w-full h-auto object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <span className="inline-block bg-pink-600 text-gray-100 px-4 py-1 rounded-full text-sm font-medium tracking-wide">
                  {blog.skillType}
                </span>
              </div>
            </div>

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-500 rounded-3xl"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
