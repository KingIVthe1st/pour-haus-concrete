/**
 * Smart Header Module
 * Buttery smooth hide/show based on scroll direction
 *
 * Features:
 * - Fades out smoothly when scrolling down
 * - Fades in smoothly when scrolling up
 * - Scroll threshold prevents jitter
 * - Always visible at top of page
 * - GPU-accelerated transforms
 * - Integrates with Lenis smooth scroll
 */

import gsap from "gsap";

/**
 * Initialize smart header behavior
 * @param {Lenis} lenis - Lenis smooth scroll instance
 */
export function initSmartHeader(lenis) {
  const header = document.querySelector("header");
  if (!header) return;

  // Configuration
  const config = {
    hideThreshold: 100, // Start hiding after scrolling this many pixels down
    scrollDelta: 10, // Minimum scroll distance to trigger hide/show
    animationDuration: 0.4, // Animation duration in seconds
    ease: "power3.out", // GSAP easing
  };

  // State
  let lastScrollY = 0;
  let isHidden = false;
  let ticking = false;

  // Set initial styles for GPU acceleration
  gsap.set(header, {
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    transform: "translateZ(0)",
  });

  /**
   * Handle scroll direction change
   */
  function handleScroll(currentScrollY) {
    const scrollDelta = currentScrollY - lastScrollY;
    const isScrollingDown = scrollDelta > 0;
    const isScrollingUp = scrollDelta < 0;

    // Always show header at top of page
    if (currentScrollY < config.hideThreshold) {
      if (isHidden) {
        showHeader();
      }
      lastScrollY = currentScrollY;
      return;
    }

    // Check if scroll delta exceeds threshold (prevents jitter)
    if (Math.abs(scrollDelta) < config.scrollDelta) {
      return;
    }

    // Hide on scroll down
    if (isScrollingDown && !isHidden && currentScrollY > config.hideThreshold) {
      hideHeader();
    }

    // Show on scroll up
    if (isScrollingUp && isHidden) {
      showHeader();
    }

    lastScrollY = currentScrollY;
  }

  /**
   * Hide header with smooth animation
   */
  function hideHeader() {
    isHidden = true;

    gsap.to(header, {
      y: "-100%",
      opacity: 0,
      duration: config.animationDuration,
      ease: config.ease,
      onStart: () => {
        header.style.pointerEvents = "none";
      },
    });
  }

  /**
   * Show header with smooth animation
   */
  function showHeader() {
    isHidden = false;

    gsap.to(header, {
      y: "0%",
      opacity: 1,
      duration: config.animationDuration,
      ease: config.ease,
      onComplete: () => {
        header.style.pointerEvents = "auto";
      },
    });
  }

  // Listen to Lenis scroll events for smooth integration
  if (lenis) {
    lenis.on("scroll", ({ scroll }) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll(scroll);
          ticking = false;
        });
        ticking = true;
      }
    });
  } else {
    // Fallback to native scroll if Lenis not available
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll(window.scrollY);
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  // Return control functions for external use
  return {
    show: showHeader,
    hide: hideHeader,
    isHidden: () => isHidden,
  };
}
