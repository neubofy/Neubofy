import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Profile & Capabilities | Neubofy",
  description: "Manage your specialist capabilities, portfolio, CV, and account security within the Neubofy Orchestration Network.",
};

export default function PartnerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
