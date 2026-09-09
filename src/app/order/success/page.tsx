"use client";

import React, { useEffect, useState } from "react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { CheckCircle2, ServerCog, MailCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 1500);
    const timer2 = setTimeout(() => setStage(2), 3500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center relative overflow-hidden">
        <div className="glass-card p-8 md:p-12 rounded-3xl text-center max-w-xl w-full border border-white/10 relative z-10 mx-4 bg-black/60 backdrop-blur-xl">

          <h1 className="text-3xl font-display font-bold mb-10 text-white tracking-tight">Your request is now with Neubofy.</h1>

          <div className="space-y-6 mb-12">

            {/* Stage 0 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-left p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Request Received</h3>
                <p className="text-sm text-muted-foreground">Your business problem has been successfully submitted.</p>
              </div>
            </motion.div>

            {/* Stage 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={stage >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              className={`flex items-center gap-4 text-left p-4 rounded-xl border transition-colors ${stage >= 1 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stage >= 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/30'}`}>
                {stage === 1 ? (
                  <ServerCog className="w-5 h-5 animate-[spin_3s_linear_infinite]" />
                ) : (
                  <ServerCog className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${stage >= 1 ? 'text-white' : 'text-white/50'}`}>Requirements Review</h3>
                <p className={`text-sm ${stage >= 1 ? 'text-blue-200/70' : 'text-muted-foreground/50'}`}>
                  {stage === 1 ? 'Our team is processing the information...' : 'Information processed.'}
                </p>
              </div>
            </motion.div>

            {/* Stage 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={stage >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              className="flex items-center gap-4 text-left p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                <MailCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Next Step</h3>
                <p className="text-sm text-muted-foreground">A Neubofy coordinator will contact you shortly to begin translation and architecture.</p>
              </div>
            </motion.div>

          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={stage >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full hover:bg-white/90 transition-colors font-medium group">
              Return to Homepage
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
}
