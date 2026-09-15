import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Login | Neubofy",
  description: "Log in to your Neubofy Partner Account to manage your capabilities, project status, and profile details.",
};

export default function PartnerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
