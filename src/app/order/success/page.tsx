import React from "react";
import PageTransition from "@/components/PageTransition";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="glass-card p-12 rounded-3xl text-center max-w-lg w-full">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-display mb-4 text-white">Project Submitted!</h1>
          <p className="text-gray-300 mb-8 text-lg">
            Thank you for starting a project with Neubofy. Our team will review your request and get back to you shortly.
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
