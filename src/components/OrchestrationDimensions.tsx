"use client";

import { motion } from "framer-motion";
import { Layers, Users, Clock, CircleDollarSign } from "lucide-react";

const OrchestrationDimensions = () => {
  const dimensions = [
    { id: "what", title: "WHAT", desc: "What needs to happen?", icon: Layers, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { id: "who", title: "WHO", desc: "Who should do it?", icon: Users, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { id: "when", title: "WHEN", desc: "In what sequence?", icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { id: "cost", title: "COST", desc: "What should it cost?", icon: CircleDollarSign, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 mb-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

      {/* Central Orchestrator Node */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full border border-white/20 bg-black/80 backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]" border-style="dashed"></div>
        <img src="/neubofylogo.png" alt="Neubofy Logo" className="w-12 h-12 md:w-16 md:h-16 opacity-80" />
        <span className="text-[10px] uppercase tracking-widest text-white/50 mt-2 font-semibold">Orchestrator</span>
      </motion.div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10 w-full md:w-auto">
        {dimensions.map((dim, index) => (
          <motion.div
            key={dim.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            viewport={{ once: true }}
            className={`flex flex-col items-start p-4 md:p-6 rounded-2xl border ${dim.border} bg-black/60 backdrop-blur-sm min-w-[140px] md:min-w-[180px] hover:bg-white/5 transition-colors group`}
          >
            <div className={`w-8 h-8 rounded-full ${dim.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <dim.icon className={`w-4 h-4 ${dim.color}`} />
            </div>
            <h4 className="text-sm font-bold tracking-widest text-foreground mb-1">{dim.title}</h4>
            <p className="text-xs text-muted-foreground">{dim.desc}</p>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default OrchestrationDimensions;