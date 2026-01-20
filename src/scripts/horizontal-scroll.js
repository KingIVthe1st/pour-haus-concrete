/**
 * Horizontal Scroll Module
 * Works gallery with scroll-hijack
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize horizontal scroll gallery
 * @param {Lenis} lenis - Lenis instance
 */
export function initHorizontalScroll(lenis) {
  const section = document.querySelector(".h-scroll-section");
  const container = document.querySelector(".h-scroll-container");
  const track = document.querySelector(".h-scroll-track");

  if (!section || !container || !track) return;

  // Calculate scroll distance
  const getScrollAmount = () => {
    return -(track.scrollWidth - window.innerWidth);
  };

  // Create horizontal scroll animation
  const tween = gsap.to(track, {
    x: getScrollAmount,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Handle resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

  // Add progress indicator (optional)
  const cards = track.querySelectorAll(".h-scroll-card");
  const totalCards = cards.length;

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    onUpdate: (self) => {
      const progress = Math.round(self.progress * (totalCards - 1)) + 1;
      // Could update a progress indicator here
      // e.g., document.querySelector('.progress').textContent = `${progress}/${totalCards}`;
    },
  });
}
