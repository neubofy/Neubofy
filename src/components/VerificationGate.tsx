"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const VerificationGate = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const gates = [
    { id: "build", label: "BUILD", x: 100 },
    { id: "test", label: "TEST", x: 260 },
    { id: "security", label: "SECURITY", x: 420 },
    { id: "review", label: "REVIEW", x: 580 },
    { id: "acceptance", label: "ACCEPTANCE", x: 740 },
    { id: "delivery", label: "DELIVERY", x: 900 },
  ];

  if (!mounted) return <div className="w-full h-32 md:h-48 bg-transparent"></div>;

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden pb-4 hide-scrollbar">
      <div className="min-w-[800px] w-full max-w-5xl mx-auto h-32 md:h-48 relative flex items-center justify-center">
        <svg viewBox="0 0 1000 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base Track */}
          <line x1="100" y1="60" x2="900" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />

          {/* Animated Progress Track */}
          <motion.line
            x1="100" y1="60" x2="900" y2="60"
            stroke="rgba(16, 185, 129, 0.5)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 4, ease: "linear" }}
          />

          {gates.map((gate, index) => {
            const isLast = index === gates.length - 1;
            const delay = index * 0.7; // Correlates with the line drawing speed (4s total)

            return (
              <g key={gate.id} transform={`translate(${gate.x}, 60)`}>
                {/* Static Background Node */}
                <circle cx="0" cy="0" r="12" fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                {/* Animated Fill Node indicating success */}
                <motion.circle
                  cx="0" cy="0" r="12"
                  fill="#10b981"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: delay }}
                />

                {/* Pulsing ring for the final delivery state */}
                {isLast && (
                  <motion.circle
                    cx="0" cy="0" r="24"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.5)"
                    strokeWidth="1"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1.5, opacity: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: delay, repeat: Infinity }}
                  />
                )}

                {/* Text Label */}
                <motion.text
                  x="0" y={isLast ? "-25" : "30"}
                  fill={isLast ? "#10b981" : "rgba(255,255,255,0.6)"}
                  fontSize="11"
                  fontFamily="sans-serif"
                  fontWeight="600"
                  textAnchor="middle"
                  className="uppercase tracking-widest"
                  initial={{ opacity: 0, y: isLast ? 0 : -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: delay }}
                >
                  {gate.label}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default VerificationGate;