
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ParallaxBackgroundProps {
  children: React.ReactNode;
}

const ParallaxBackground = ({ children }: ParallaxBackgroundProps) => {
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [press, setPress] = useState<{x: number, y: number} | null>(null);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Reset press after animation
  useEffect(() => {
    if (press) {
      const timeout = setTimeout(() => setPress(null), 400);
      return () => clearTimeout(timeout);
    }
  }, [press]);
  return (
    <div
      className="relative"
      onClick={e => {
        // Get click position relative to viewport
        setPress({
          x: e.clientX,
          y: e.clientY
        });
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Parallax Elements with press effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-64 h-64 bg-primary/10 rounded-full blur-3xl"
          style={{
            left: -128,
            top: -128
          }}
          animate={press ? {
            scale: 0.7,
            x: press.x - 128,
            y: press.y - 128,
            filter: "brightness(0.85)"
          } : {
            scale: 1,
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
            filter: "brightness(1)"
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        <motion.div
          className="absolute w-48 h-48 bg-secondary/10 rounded-full blur-3xl"
          style={{
            left: -96,
            top: -96
          }}
          animate={press ? {
            scale: 0.8,
            x: press.x - 96,
            y: press.y - 96,
            filter: "brightness(0.9)"
          } : {
            scale: 1,
            x: mousePosition.x - 96,
            y: mousePosition.y - 96,
            filter: "brightness(1)"
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
        <motion.div
          className="absolute w-56 h-56 bg-tertiary/10 rounded-full blur-3xl"
          style={{
            left: -112,
            top: -112
          }}
          animate={press ? {
            scale: 0.6,
            x: press.x - 112,
            y: press.y - 112,
            filter: "brightness(0.8)"
          } : {
            scale: 1,
            x: mousePosition.x - 112,
            y: mousePosition.y - 112,
            filter: "brightness(1)"
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      </div>
      {children}
    </div>
  );
};

export default ParallaxBackground;