"use client";

import React from "react";
import { Hammer, Sparkles, TerminalSquare, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center pt-24 pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-primary mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">New Infrastructure</span>
        </div>

        {/* Hero Section */}
        <div className="space-y-6 mb-16">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Developer Profiles
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mt-2 inline-block">
              Coming Soon
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            We're building the ultimate global platform for independent and student developers to showcase their capabilities and connect directly with clients.
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 text-left mb-16 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <div className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <TerminalSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Showcase Portfolios</h3>
            <p className="text-muted-foreground">List your best projects and let your capabilities speak for themselves on a global stage.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Direct Networking</h3>
            <p className="text-muted-foreground">Connect with clients instantly. Zero platform fees, zero middleman interference.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Hammer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Robust Backend</h3>
            <p className="text-muted-foreground">We are engineering a powerful infrastructure to manage and scale your developer content seamlessly.</p>
          </div>
        </div>

        {/* Action */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "400ms" }}>
          <Button disabled className="btn-electric rounded-full px-8 py-6 text-lg w-full sm:w-auto cursor-not-allowed opacity-50">
            Register Developer (Coming Soon)
          </Button>
          <Link href="/orbit">
            <Button variant="outline" className="rounded-full px-8 py-6 text-lg border-primary/20 hover:border-primary hover:bg-primary/5 w-full sm:w-auto">
              Explore Projects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
