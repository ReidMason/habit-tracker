import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "A tracker for your habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
