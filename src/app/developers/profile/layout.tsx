import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Profile",
  description: "Manage your Neubofy developer profile and see verified skills.",
  robots: {
    index: false,
    follow: false
  }
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
