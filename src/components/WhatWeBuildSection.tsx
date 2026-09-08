"use client";

import { motion } from "framer-motion";
import { Smartphone, Monitor, Globe, Briefcase, LayoutDashboard, Bot, Cpu, Zap, Network, LucideIcon } from "lucide-react";

const renderIcon = (IconComponent: LucideIcon, x: number, y: number, label: string, delay: string) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={`${x},${y}; ${x},${y - 5}; ${x},${y}`}
        dur="4s"
        repeatCount="indefinite"
        begin={`${delay}s`}
      />
      <circle cx="0" cy="0" r="24" fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
         <animate attributeName="stroke" values="rgba(255,255,255,0.2); rgba(255,255,255,0.6); rgba(255,255,255,0.2)" dur="4s" repeatCount="indefinite" begin={`${delay}s`} />
      </circle>

      {/* ForeignObject allows rendering React components like lucide-react inside SVG */}
      <foreignObject x="-12" y="-12" width="24" height="24">
        <div className="w-full h-full flex items-center justify-center text-primary/80">
          <IconComponent size={20} />
        </div>
      </foreignObject>
      <text x="0" y="40" textAnchor="middle" fill="#ccc" fontSize="12" fontWeight="500">{label}</text>
    </g>
  );
};

const WhatWeBuildSection = () => {
  return (
    <section className="py-24 bg-black/50 border-y border-white/5 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Whatever Your Business Needs to Build.
          </h2>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            From websites and applications to custom business systems and AI-powered workflows, Neubofy helps turn business requirements into practical software solutions.
          </p>
        </motion.div>

        <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] md:aspect-[16/9] flex items-center justify-center">
          <svg viewBox="0 0 800 500" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Lines from Business Idea to Neubofy with moving particles */}
            <path id="path-in" d="M 160 250 L 340 250" fill="none" stroke="url(#line-gradient)" strokeWidth="2" />
            <circle r="4" fill="#fff" filter="url(#glow)">
              <animateMotion dur="2s" repeatCount="indefinite">
                <mpath href="#path-in" />
              </animateMotion>
            </circle>

            {/* Lines from Neubofy to Software with moving particles */}
            <path id="path-out" d="M 460 250 L 640 250" fill="none" stroke="url(#line-gradient)" strokeWidth="2" />
            <circle r="4" fill="#fff" filter="url(#glow)">
              <animateMotion dur="2s" repeatCount="indefinite">
                <mpath href="#path-out" />
              </animateMotion>
            </circle>

            {/* Central Node (Neubofy Orchestrator) */}
            <g transform="translate(400, 250)">
              {/* Outer pulsing ring */}
              <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                <animate attributeName="r" values="70; 90; 70" dur="4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1; 0; 1" dur="4s" repeatCount="indefinite" />
              </circle>

              <circle cx="0" cy="0" r="60" fill="#0f0f0f" stroke="rgba(255,255,255,0.2)" strokeWidth="2" filter="url(#glow)" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
              </circle>

              <image href="/neubofylogo.png" x="-25" y="-35" height="50" width="50" />

              {/* Internal workflow steps */}
              <text x="0" y="25" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">Understand → Translate → Plan</text>
              <text x="0" y="38" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">Select → Build → Verify</text>
            </g>

            {/* Input Node (Business Idea) */}
            <g transform="translate(100, 250)">
              <rect x="-60" y="-30" width="120" height="60" rx="8" fill="#111" stroke="rgba(255,255,255,0.3)">
                <animate attributeName="stroke" values="rgba(255,255,255,0.3);rgba(255,255,255,0.8);rgba(255,255,255,0.3)" dur="3s" repeatCount="indefinite" />
              </rect>
              <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">BUSINESS IDEA</text>
            </g>

            {/* Output Node (Software) */}
            <g transform="translate(700, 250)">
              <rect x="-60" y="-30" width="120" height="60" rx="8" fill="#111" stroke="rgba(255,255,255,0.3)">
                <animate attributeName="stroke" values="rgba(255,255,255,0.3);rgba(255,255,255,0.8);rgba(255,255,255,0.3)" dur="3s" repeatCount="indefinite" />
              </rect>
              <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">SOFTWARE</text>
            </g>

            {/* Top Categories */}
            <g transform="translate(400, 70)">
              {/* Lines branching out */}
              <path id="top-line-1" d="M 0 110 L -210 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="top-line-2" d="M 0 110 L -70 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="top-line-3" d="M 0 110 L 70 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="top-line-4" d="M 0 110 L 210 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />

              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="3s" repeatCount="indefinite"><mpath href="#top-line-1" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#top-line-2" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="2.8s" repeatCount="indefinite"><mpath href="#top-line-3" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="3.2s" repeatCount="indefinite"><mpath href="#top-line-4" /></animateMotion>
              </circle>

              {renderIcon(Smartphone, -210, 0, "Mobile Apps", "0")}
              {renderIcon(Monitor, -70, 0, "Web Apps", "0.5")}
              {renderIcon(Globe, 70, 0, "Websites", "1")}
              {renderIcon(Briefcase, 210, 0, "Business Software", "1.5")}
            </g>

            {/* Bottom Categories */}
            <g transform="translate(400, 430)">
              {/* Lines branching out */}
              <path id="bot-line-1" d="M 0 -110 L -250 -24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="bot-line-2" d="M 0 -110 L -125 -24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="bot-line-3" d="M 0 -110 L 0 -24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="bot-line-4" d="M 0 -110 L 125 -24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
              <path id="bot-line-5" d="M 0 -110 L 250 -24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />

              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="3.1s" repeatCount="indefinite"><mpath href="#bot-line-1" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="2.9s" repeatCount="indefinite"><mpath href="#bot-line-2" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="3.4s" repeatCount="indefinite"><mpath href="#bot-line-3" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="2.7s" repeatCount="indefinite"><mpath href="#bot-line-4" /></animateMotion>
              </circle>
              <circle r="2" fill="#fff" filter="url(#glow)">
                <animateMotion dur="3.3s" repeatCount="indefinite"><mpath href="#bot-line-5" /></animateMotion>
              </circle>

              {renderIcon(LayoutDashboard, -250, 0, "Dashboards", "0.2")}
              {renderIcon(Bot, -125, 0, "AI Workflows", "0.7")}
              {renderIcon(Cpu, 0, 0, "Local AI", "1.2")}
              {renderIcon(Zap, 125, 0, "Automation", "1.7")}
              {renderIcon(Network, 250, 0, "Integrations", "2.2")}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default WhatWeBuildSection;
