import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shareplay",
    template: "%s - Shareplay",
  },
  description: "Share your playlist with the world",
  openGraph: {
    title: "Shareplay",
    description: "Share your playlist with the world",
    siteName: "Shareplay",
    type: "website",
  },
  verification: {
    google: "SlaIdfQ1Mb75JUq7z0mlUKKo8OGFTxS2v9lMsYEW24k",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${figtree.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
