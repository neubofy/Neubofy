"use client";

import { motion } from "framer-motion";
import { Layers, Globe, Smartphone, BrainCircuit, Workflow, Code, CheckCircle2 } from "lucide-react";

const RequestFlowAnimation = () => {
  // Icons mapped to software requests
  const requests = [
    { id: 1, icon: Smartphone, label: "Android App", delay: 0 },
    { id: 2, icon: Globe, label: "Web App", delay: 0.5 },
    { id: 3, icon: Layers, label: "Static Website", delay: 1.0 },
    { id: 4, icon: BrainCircuit, label: "AI Pipeline", delay: 1.5 },
    { id: 5, icon: Workflow, label: "Workflow", delay: 2.0 },
    { id: 6, icon: Code, label: "Any Software", delay: 2.5 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-16 p-8 relative">
      <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl -z-10" />

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
          Software On-Demand for Everyone
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Whether you are a power user, founder, small business, or enterprise. We have developers of every level ready to build exactly what you need.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Left Side: Users */}
        <div className="flex flex-col gap-6 w-full md:w-1/4">
          <motion.div
            className="glass-card p-4 rounded-xl flex items-center justify-center font-semibold text-primary"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Power User
          </motion.div>
          <motion.div
            className="glass-card p-4 rounded-xl flex items-center justify-center font-semibold text-secondary"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Founder
          </motion.div>
          <motion.div
            className="glass-card p-4 rounded-xl flex items-center justify-center font-semibold text-tertiary"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Business (Big & Small)
          </motion.div>
        </div>

        {/* Center: Animated Flow */}
        <div className="flex-1 relative min-h-[300px] w-full flex items-center justify-center">
          {/* Central Hub representing Neubofy Platform */}
          <motion.div
            className="absolute z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
            animate={{
              boxShadow: ["0px 0px 0px 0px rgba(var(--primary), 0.4)", "0px 0px 40px 10px rgba(var(--primary), 0.2)", "0px 0px 0px 0px rgba(var(--primary), 0.4)"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="text-white font-bold text-xl">Neubofy</div>
          </motion.div>

          {/* Floating Request Nodes */}
          {requests.map((req, index) => {
            const angle = (index / requests.length) * Math.PI * 2;
            const radius = 140;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={req.id}
                className="absolute flex flex-col items-center justify-center gap-2"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: x,
                  y: y,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.8,
                  delay: req.delay,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-foreground border border-primary/20">
                  <req.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium bg-background/50 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5">
                  {req.label}
                </span>

                {/* Connecting Line (SVG) */}
                <svg className="absolute top-1/2 left-1/2 -z-10 overflow-visible" style={{ width: 0, height: 0 }}>
                  <motion.line
                    x1="0"
                    y1="0"
                    x2={-x}
                    y2={-y}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="text-primary/30"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: req.delay + 0.5 }}
                  />
                </svg>
              </motion.div>
            );
          })}
        </div>

        {/* Right Side: Developers */}
        <div className="flex flex-col gap-6 w-full md:w-1/4">
          <motion.div
            className="glass-card p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-green-500"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <CheckCircle2 className="text-green-500 w-5 h-5" />
            <span className="font-medium text-sm">Junior Devs</span>
          </motion.div>
          <motion.div
            className="glass-card p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-blue-500"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <CheckCircle2 className="text-blue-500 w-5 h-5" />
            <span className="font-medium text-sm">Mid-level Devs</span>
          </motion.div>
          <motion.div
            className="glass-card p-4 rounded-xl flex items-center gap-3 border-l-4 border-l-purple-500"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <CheckCircle2 className="text-purple-500 w-5 h-5" />
            <span className="font-medium text-sm">Senior Devs</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RequestFlowAnimation;