import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "./globals.css";
import { Navbar } from "@/components/navbar/index";

const font = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App",
  description:
    "Todost is a simple and easy-to-use todo list app that helps you stay organized.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={font.className}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
