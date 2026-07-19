"use client";

import { ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
};

const Reveal = ({ children, delay = 0, y = 20, once = true }: RevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once, margin: "0px 0px -15% 0px" });
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div ref={ref}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : y }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ willChange: "opacity, transform", transform: "translateZ(0)" }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;