import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Initiate a technology project with Neubofy. Let us orchestrate your technology needs and translate your business problems into precise technological solutions.",
  keywords: ["start project", "neubofy project", "technology needs", "business problem technology solution", "hire developers", "technology orchestration order"],
  alternates: {
    canonical: "https://neubofy.in/order"
  }
};

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
