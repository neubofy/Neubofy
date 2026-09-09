"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const OrchestrationSystem = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="absolute inset-0 w-full h-full min-h-[600px]"></div>;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 flex items-center justify-center opacity-30 sm:opacity-50">
      <svg
        className="w-[200%] sm:w-[150%] md:w-full h-full max-w-6xl"
        viewBox="0 0 1000 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Core Paths (Subtle background paths) */}
        <path d="M100,300 C250,300 350,150 500,150" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M100,300 C250,300 350,450 500,450" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M500,150 C650,150 750,300 900,300" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M500,450 C650,450 750,300 900,300" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <path d="M500,150 L500,450" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Animated Flow Paths */}
        <motion.path
          d="M100,300 C250,300 350,150 500,150"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }}
        />
        <motion.path
          d="M100,300 C250,300 350,450 500,450"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 0.5 }}
        />
        <motion.path
          d="M500,150 C650,150 750,300 900,300"
          stroke="rgba(59,130,246,0.5)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 1.5 }}
        />
        <motion.path
          d="M500,450 C650,450 750,300 900,300"
          stroke="rgba(59,130,246,0.5)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay: 2 }}
        />

        {/* Nodes */}
        {/* Business Problem Node */}
        <g transform="translate(100, 300)">
          <circle cx="0" cy="0" r="8" fill="#ffffff" />
          <motion.circle
            cx="0" cy="0" r="24"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <text x="-15" y="-20" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="sans-serif" textAnchor="end" className="uppercase tracking-widest font-semibold">Business Problem</text>
        </g>

        {/* AI & Software Partner Node */}
        <g transform="translate(500, 150)">
          <circle cx="0" cy="0" r="6" fill="#3b82f6" />
          <text x="0" y="-15" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="sans-serif" textAnchor="middle" className="uppercase tracking-widest">AI & Software</text>
        </g>

        {/* Security & QA Partner Node */}
        <g transform="translate(500, 450)">
          <circle cx="0" cy="0" r="6" fill="#3b82f6" />
          <text x="0" y="25" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="sans-serif" textAnchor="middle" className="uppercase tracking-widest">Security & QA</text>
        </g>

        {/* Delivery / Handover Node */}
        <g transform="translate(900, 300)">
          <circle cx="0" cy="0" r="8" fill="#10b981" />
          <motion.circle
            cx="0" cy="0" r="32"
            fill="none"
            stroke="rgba(16,185,129,0.3)"
            strokeWidth="1"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          <text x="15" y="-15" fill="rgba(16,185,129,0.7)" fontSize="12" fontFamily="sans-serif" textAnchor="start" className="uppercase tracking-widest font-semibold">Verified Delivery</text>
        </g>

        {/* Traveling Particles to simulate data flowing through orchestration */}
        <motion.circle
          r="3"
          fill="#ffffff"
          initial={{ cx: 100, cy: 300, opacity: 0 }}
          animate={{
            cx: [100, 250, 350, 500],
            cy: [300, 300, 150, 150],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.circle
          r="3"
          fill="#ffffff"
          initial={{ cx: 100, cy: 300, opacity: 0 }}
          animate={{
            cx: [100, 250, 350, 500],
            cy: [300, 300, 450, 450],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
        />

      </svg>
    </div>
  );
};

export default OrchestrationSystem;
