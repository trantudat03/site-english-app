import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const pixelTitle = Press_Start_2P({
  variable: "--font-pixel-title",
  subsets: ["latin"],
  weight: "400",
});

const pixelBody = VT323({
  variable: "--font-pixel-body",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Pixel English Quest",
  description: "A pixel-game styled English learning app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelTitle.variable} ${pixelBody.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
