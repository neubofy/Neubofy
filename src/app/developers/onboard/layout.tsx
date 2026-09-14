import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Partner | Onboard",
  description: "Onboard into the Neubofy independent partner network. Provide your skills and get matched with qualified opportunities.",
  keywords: ["become a partner", "developer onboarding", "join neubofy network", "freelance network signup"],
  alternates: {
    canonical: "https://neubofy.in/developers/onboard"
  }
};

export default function OnboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
