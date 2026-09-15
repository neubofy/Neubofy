import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neubofy Partner Network | Technology Specialists & Recruitment",
  description: "Join the Neubofy Partner Network. We orchestrate independent technology specialists, coordinate delivery, and connect qualified developers, AI architects, and security engineers with high-stakes projects.",
  keywords: ["partner network", "independent developers", "technology specialists", "AI architects", "software engineers", "security auditors", "Neubofy recruitment"],
  alternates: {
    canonical: "https://neubofy.in/partner"
  }
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
