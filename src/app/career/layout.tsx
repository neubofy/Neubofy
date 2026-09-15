import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers & Specialist Network | Neubofy",
  description: "Explore careers with Neubofy. We orchestrate independent technology specialists, coordinate delivery, and connect qualified developers, AI architects, and security engineers with high-stakes projects.",
  keywords: ["careers", "technology specialists", "AI architects", "software engineers", "security auditors", "Neubofy recruitment", "independent developers"],
  alternates: {
    canonical: "https://neubofy.in/career"
  }
};

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

