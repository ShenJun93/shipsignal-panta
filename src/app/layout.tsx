import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Turn a GitHub pull request into a Panta prediction market: score the delivery evidence, find markets about the PR, and draft one that resolves from GitHub.";

export const metadata: Metadata = {
  metadataBase: new URL("https://shipsignal-panta.vercel.app"),
  title: "ShipSignal — Engineering delivery intelligence",
  description,
  openGraph: {
    title: "ShipSignal — turn a pull request into a market the crowd can price",
    description,
    url: "/",
    siteName: "ShipSignal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShipSignal — turn a pull request into a market the crowd can price",
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}