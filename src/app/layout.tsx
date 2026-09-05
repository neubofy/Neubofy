import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import GoToTop from "@/components/GoToTop";
import HoldOverlay from "@/components/HoldOverlay";
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neubofy | Network of Top Developers",
  description: "Neubofy is a platform that connects you with the world's top developers, helping consumers find the best talent to build high-quality products at competitive costs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col relative bg-background text-foreground">
        <HoldOverlay />
        <ScrollProgress />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <GoToTop />
        <Analytics />
        <Script id="zoho-salesiq-init" strategy="lazyOnload">
          {`window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}`}
        </Script>
        <Script id="zsiqscript" src="https://salesiq.zoho.in/widget?wc=siq9312488e4d8e0df500748f7a2fc1e8769385757ecd612b79f3d0afb943c616a1" strategy="lazyOnload" />
      </body>
    </html>
  );
}
