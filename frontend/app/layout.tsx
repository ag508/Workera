import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workera - Enterprise-Grade Recruitment Automation Platform",
  description: "AI-powered recruitment platform with intelligent resume parsing, semantic candidate search, and automated hiring workflows. Built for enterprise scale.",
  keywords: ["recruitment", "ATS", "AI hiring", "resume parsing", "candidate matching", "HR automation"],
  authors: [{ name: "Kauzway" }],
  openGraph: {
    title: "Workera - Intelligent Recruitment Automation",
    description: "Transform your hiring process with AI-powered resume parsing and candidate matching",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
