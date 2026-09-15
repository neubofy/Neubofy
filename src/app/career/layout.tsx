import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers & Specialist Network | Neubofy",
  description: "Join the Neubofy Specialist Network. We orchestrate independent technology specialists, coordinate delivery, and connect qualified developers, AI architects, and security engineers with high-stakes projects.",
  keywords: ["careers", "independent developers", "technology specialists", "AI architects", "software engineers", "security auditors", "Neubofy careers"],
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
