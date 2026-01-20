/**
 * Smooth Scroll Module
 * Uses Lenis for premium momentum scrolling
 */

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize Lenis smooth scroll
 * @returns {Lenis} Lenis instance
 */
export function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  // Use GSAP ticker for smooth animation frame sync
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  // Disable GSAP's lag smoothing for better scroll sync
  gsap.ticker.lagSmoothing(0);

  // Handle anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    });
  });

  // Expose lenis globally for debugging
  window.lenis = lenis;

  return lenis;
}
