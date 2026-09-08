import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SmoothScrolling from "@/components/SmoothScrolling";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import GoToTop from "@/components/GoToTop";
import LiquidThreeBackground from "@/components/LiquidThreeBackground";
import { Analytics } from '@vercel/analytics/next';
import Script from "next/script";
import FirebaseInitializer from "@/components/firebase/FirebaseInitializer";

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
    default: "Neubofy | Your Technology Department, Without Building One",
    template: "%s | Neubofy",
  },
  description: "Neubofy is your on-demand technology department. We bridge the gap between business ideas and flawless execution by translating requirements, selecting expert builders, managing architecture, and verifying software before delivery.",
  keywords: ["Technology Department as a Service", "Software Development Management", "App Builder Verification", "Tech Architecture", "Outsourced CTO", "Software Engineering", "Business Technology Solution", "Neubofy"],
  authors: [{ name: "Neubofy" }],
  creator: "Neubofy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://neubofy.in",
    title: "Neubofy | Your Technology Department",
    description: "Build the right software, not just software. Neubofy translates your business needs into technical reality with expert builders and rigorous verification.",
    siteName: "Neubofy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Neubofy | Technology Department as a Service",
    description: "We translate your idea into the right technical plan, select the right builder, manage the project, and verify the software before delivery.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  const firebaseConfig = {
    apiKey: process.env.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.measurementId || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <body className="flex flex-col relative bg-background text-foreground min-h-screen">
        <FirebaseInitializer config={firebaseConfig} />
        <SmoothScrolling>
          <LiquidThreeBackground />
          <ScrollProgress />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <GoToTop />
          <Analytics />
          {gaId && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', '${gaId}');
                `}
              </Script>
            </>
          )}
          <Script id="zoho-salesiq-init" strategy="lazyOnload">
            {`window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}`}
          </Script>
          <Script id="zsiqscript" src="https://salesiq.zoho.in/widget?wc=siq9312488e4d8e0df500748f7a2fc1e8769385757ecd612b79f3d0afb943c616a1" strategy="lazyOnload" />
        </SmoothScrolling>
      </body>
    </html>
  );
}
