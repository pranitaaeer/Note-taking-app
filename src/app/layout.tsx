import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// 1. Google font configure karein
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SecureNotes - Encrypted Sharing",
  description: "Secure note-taking with expiring links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* 2. Body par font class apply karein */}
      <body className={`${jakarta.className} bg-[#020202] text-white antialiased selection:bg-violet-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}