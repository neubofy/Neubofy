import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Neubofy Partner Network | Fast Sign-Up",
  description: "Sign up to join the Neubofy Orchestration Network as an independent software, AI, security, or technology specialist.",
};

export default function PartnerOnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
