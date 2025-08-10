import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Lenis for smooth scrolling
import Lenis from 'lenis';

createRoot(document.getElementById("root")!).render(<App />);


// Initialize Lenis for ultra-smooth scrolling (valid options only)
const lenis = new Lenis({
	duration: 2.0, // Higher duration for more smoothness
	easing: (t) => 1 - Math.pow(1 - t, 4), // Ultra-smooth cubic easing
	gestureOrientation: 'vertical',
	touchMultiplier: 1.5, // More responsive on touch
	wheelMultiplier: 1.2, // Smoother on wheel
});

function raf(time: number) {
	lenis.raf(time);
	requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                registration.waiting.addEventListener('statechange', (e) => {
                    // @ts-ignore
                    if (e?.target?.state === 'activated') {
                        window.location.reload();
                    }
                });
            }
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    }
                });
            });
        }).catch((err) => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
