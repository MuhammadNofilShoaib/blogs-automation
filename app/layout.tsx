import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'], // required
  weight: ['400', '500', '600', '700'], // optional: define weights you want to use
  style: ['normal', 'italic'], // optional
  display: 'swap', // optional, good for performance
});

export const metadata: Metadata = {
  title: "Blogs Automation",
  description: "Built by Nofil Shoaib",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} bg-black antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
