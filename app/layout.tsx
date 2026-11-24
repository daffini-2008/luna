import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Luna's Matrimony — Find your kind of crazy",
  description:
    "A playful personality quiz, thoughtful matches and a little celebrity-inspired fun. Your soulmate might be one quiz away.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
