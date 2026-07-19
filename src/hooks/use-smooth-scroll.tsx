"use client";
import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    // Smooth scroll to top when component mounts
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // Add smooth scroll behavior to all internal links
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.hash && link.hostname === window.location.hostname) {
        e.preventDefault();
        const targetElement = document.querySelector(link.hash);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleInternalLinks);
    
    return () => {
      document.removeEventListener('click', handleInternalLinks);
    };
  }, []);
}; 