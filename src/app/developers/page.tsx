"use client";

import React from "react";
import { Shield, Lock, Terminal, Brain, Code2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DevelopersPage() {
  return (
    <PageTransition>
      <div className="container mx-auto py-24 px-4 max-w-5xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Strictly Private Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join the Neubofy™ <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Builder Intelligence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We do not publicly expose our developers. All data is completely private. We hand-select appropriate builders for verified client projects.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card p-8 rounded-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Developers</h3>
            <p className="text-muted-foreground text-sm">
              Machine learning engineers, LLM orchestrators, and data scientists building next-gen solutions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 rounded-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Security Analysts</h3>
            <p className="text-muted-foreground text-sm">
              Security researchers and code analysts verifying the integrity and safety of delivered software.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-8 rounded-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mx-auto mb-6">
              <Code2 className="w-8 h-8 text-tertiary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Software Engineers</h3>
            <p className="text-muted-foreground text-sm">
              Frontend, backend, mobile, and full-stack developers architecting robust applications.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card p-10 rounded-3xl text-center max-w-3xl mx-auto border border-primary/20"
        >
          <Terminal className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
          <p className="text-muted-foreground mb-8">
            Register your interest to join our private network. Our team reviews all applications and will contact you when a project matches your exact skill set. You get qualified projects without having to become the salesperson.
          </p>
          <a
            href="https://neubofy.zohodesk.in/portal"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-full h-12"
          >
            Register Interest
          </a>
        </motion.div>
      </div>
    </PageTransition>
  );
}
