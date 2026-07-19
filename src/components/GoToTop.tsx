"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group animate-fade-in-up"
          aria-label="Go to top"
        >
          <ChevronUp className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </>
  );
};

export default GoToTop;