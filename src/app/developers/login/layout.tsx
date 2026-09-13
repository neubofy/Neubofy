import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Login",
  description: "Login to the Neubofy Developer Network to manage your profile and access coordinated technology projects.",
  keywords: ["partner login", "developer login", "neubofy network login"],
  alternates: {
    canonical: "https://neubofy.in/developers/login"
  }
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
