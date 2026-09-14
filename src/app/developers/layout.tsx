import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neubofy Developer Network & Partners",
  description: "Join the Neubofy developer network. We orchestrate independent technology specialists and coordinate delivery without building an internal technology department.",
  keywords: ["developer network", "independent developers", "technology specialists", "freelance developers", "AI developers", "software engineers", "security analysts"],
  alternates: {
    canonical: "https://neubofy.in/developers"
  }
};

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
