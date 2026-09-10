"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PauseCircle, X } from "lucide-react";

const ServicePausePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup shortly after mounting
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-background/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-card p-8 border border-white/10 shadow-2xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                className="mb-6 p-4 rounded-full bg-primary/20 text-primary border border-primary/30"
              >
                <PauseCircle className="w-10 h-10" />
              </motion.div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-4 text-foreground tracking-tight">
                Neubofy Services Temporarily On Hold
              </h2>

              {/* Body */}
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Neubofy is currently taking a planned pause from all services and new client engagements.
                </p>
                <p className="font-semibold text-white bg-white/5 py-2 px-4 rounded-lg border border-white/10">
                  All Neubofy services on hold till DEC 2027.
                </p>
                <p className="text-sm pt-2">
                  Thank you for your interest in Neubofy. We look forward to returning with a stronger vision and renewed focus.
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-white/10 w-full text-center">
                <span className="text-sm font-medium text-primary">
                  Services resume: January 2028
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServicePausePopup;
