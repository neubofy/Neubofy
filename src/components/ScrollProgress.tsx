"use client";

import { useEffect, useState } from "react";

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-1 bg-primary z-[60] origin-left transition-transform duration-100 ease-out" 
      style={{ transform: `scaleX(${scrollProgress / 100})`, width: "100%" }} 
    />
  );
};

export default ScrollProgress;