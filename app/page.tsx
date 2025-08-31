// "use client";

// import { PortableText, PortableTextBlock,  } from "@portabletext/react";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import type { PortableTextReactComponents } from "@portabletext/react";
// import Image from "next/image";


// interface Blog {
//   _id: string;
//   title: string;
//   slug: { current: string };
//   skillType: string;
//   mainImage?: { asset: { url: string }; alt?: string };
//   content: PortableTextBlock[];
//   publishedAt: string;
// }

// export default function Blogs() {
//   const [blogs, setBlogs] = useState<Blog[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchBlogs = async () => {
//     try {
//       const res = await fetch("/api/get-blogs", { cache: "no-store" });
//       const data = await res.json();
//       setBlogs(data);
//       setLoading(false);
//     } catch (err) {
//       console.error("Failed to fetch blogs:", err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchBlogs();
//     const interval = setInterval(fetchBlogs, 5000); // optional auto-refresh
//     return () => clearInterval(interval);
//   }, []);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="flex items-center space-x-4">
//           <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-xl font-semibold text-gray-600 animate-pulse">
//             Loading blogs...
//           </p>
//         </div>
//       </div>
//     );

//   // PortableText components

// const ptComponents: Partial<PortableTextReactComponents> = {
//   types: {
//     image: ({ value }) => (
//       <Image
//         src={value.asset.url}
//         alt={value.alt || ""}
//         width={800}
//         height={500}
//         className="my-4 rounded-lg"
//       />
//     ),
//   },
//   marks: {
//     strong: ({ children }) => <strong>{children}</strong>,
//     em: ({ children }) => <em>{children}</em>,
//     underline: ({ children }) => <u>{children}</u>,
//     link: ({ children, value }) => (
//       <Link
//         href={value.href}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="text-blue-600 underline"
//       >
//         {children}
//       </Link>
//     ),
//   },
//   block: {
//     h1: ({ children }) => <h1 className="text-4xl font-bold my-4">{children}</h1>,
//     h2: ({ children }) => <h2 className="text-3xl font-semibold my-3">{children}</h2>,
//     normal: ({ children }) => <p className="my-2">{children}</p>,
//     blockquote: ({ children }) => (
//       <blockquote className="border-l-4 pl-4 italic my-2">{children}</blockquote>
//     ),
//   },
//   list: {
//     bullet: ({ children }) => <ul className="list-disc ml-6 my-2">{children}</ul>,
//     number: ({ children }) => <ol className="list-decimal ml-6 my-2">{children}</ol>,
//   },
//   listItem: {
//     bullet: ({ children }) => <li>{children}</li>,
//     number: ({ children }) => <li>{children}</li>,
//   },
// };


//   return (
//     <div className="max-w-[1440px] mx-auto py-12 text-black">
//       <h1 className="text-5xl font-extrabold mb-12 text-center text-gradient bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
//         Latest Blogs
//       </h1>

//       <div className="grid grid-cols-2 gap-8">
//         {blogs.map((blog) => (
//           <div
//             key={blog._id}
//             className="flex flex-col justify-between p-6 border border-gray-400 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 duration-300 bg-white/70"
//           >
//             <div>
//               {blog.mainImage?.asset.url && (
//                 <img
//                   src={blog.mainImage.asset.url}
//                   alt={blog.mainImage.alt || blog.title}
//                   className="w-full h-auto object-cover rounded-xl mb-4"
//                 />
//               )}

//               <h2 className="text-4xl font-bold mb-2 hover:text-indigo-600 transition-colors duration-500">
//                 {blog.title}
//               </h2>
//               <p className="text-sm text-black/50 font-mono mb-4">
//                 {new Date(blog.publishedAt).toLocaleDateString()}{" "}
//                 {new Date(blog.publishedAt).toLocaleTimeString()}
//               </p>

//               {/* Portable Text rendering */}
//               <PortableText value={blog.content} components={ptComponents} />
//             </div>

//             <div className="mt-4">
//               <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
//                 {blog.skillType}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
'use client';
import Link from 'next/link';
import React, { useState } from 'react';

function Page() {
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const Authenticate = () => {
    // Predefined credentials
    const validEmail = "kane@jacobfrost.com.au";
    const validPassword = "blogsautomation";

    if (email === validEmail && password === validPassword) {
      setAuth(true);
      setError('');
    } else {
      setError('Invalid email or password');
      setAuth(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      {!auth && (
        <div className="flex flex-col justify-center items-center gap-5 bg-gradient-to-r from-cyan-300 to-white p-10 rounded-lg shadow-[0px_0px_100px_#ffffff80] border-black/20 border">
          <div className="flex flex-col justify-start items-start gap-1">
            <h1 className="text-black/70 font-mono font-semibold text-xl">Email:</h1>
            <input
              type="text"
              placeholder="Enter your E-Mail:"
              className="border border-black/70 p-3 rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-start items-start gap-1">
            <h1 className="text-black/70 font-mono font-semibold text-xl">Password:</h1>
            <input
              type="password"
              placeholder="Enter your Password:"
              className="border border-black/70 p-3 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={Authenticate}
            className="bg-green-500 py-3 px-5 rounded-lg font-semibold text-white hover:bg-green-700 duration-300 ease-in-out cursor-pointer"
          >
            Authenticate
          </button>
          {error && <p className="text-red-600 font-semibold">{error}</p>}
        </div>
      )}

      {auth && (
        <Link
          href="/api/generate-blog"
          className="flex justify-center items-center text-lg font-semibold px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-[0px_0px_100px_green] duration-1000 ease-in-out"
        >
          Generate Blog
        </Link>
      )}
    </div>
  );
}

export default Page;
