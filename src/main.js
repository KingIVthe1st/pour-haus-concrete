/**
 * Pour Haus Concrete - Main Entry Point
 * Award-winning website with premium animations
 */

import "./styles/globals.css";
import { initSmoothScroll } from "./scripts/smooth-scroll.js";
import { initAnimations } from "./scripts/animations.js";
import { initCursor } from "./scripts/cursor.js";
import { initAccordion } from "./scripts/accordion.js";
import { initHorizontalScroll } from "./scripts/horizontal-scroll.js";
import { initMagnetic } from "./scripts/magnetic.js";

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  // Initialize loading sequence
  initLoader();
});

/**
 * Loading sequence
 */
function initLoader() {
  const loader = document.getElementById("loader");

  // Simulate minimum load time for smooth transition
  const minLoadTime = 1500;
  const startTime = Date.now();

  // Wait for images to load (or timeout)
  Promise.all([
    document.fonts.ready,
    loadCriticalImages(),
    new Promise((resolve) => setTimeout(resolve, minLoadTime)),
  ]).then(() => {
    // Ensure minimum time has passed
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minLoadTime - elapsed);

    setTimeout(() => {
      // Hide loader
      loader.classList.add("hidden");

      // Initialize all modules
      initAllModules();
    }, remaining);
  });
}

/**
 * Load critical above-the-fold images
 */
function loadCriticalImages() {
  return new Promise((resolve) => {
    const criticalImages = document.querySelectorAll(
      'img[src*="logo"], #hero img',
    );
    let loaded = 0;
    const total = criticalImages.length || 1;

    if (total === 0) {
      resolve();
      return;
    }

    criticalImages.forEach((img) => {
      if (img.complete) {
        loaded++;
        if (loaded >= total) resolve();
      } else {
        img.addEventListener("load", () => {
          loaded++;
          if (loaded >= total) resolve();
        });
        img.addEventListener("error", () => {
          loaded++;
          if (loaded >= total) resolve();
        });
      }
    });

    // Fallback timeout
    setTimeout(resolve, 3000);
  });
}

/**
 * Initialize all interactive modules
 */
function initAllModules() {
  // Core functionality
  const lenis = initSmoothScroll();

  // Animations (needs lenis reference)
  initAnimations(lenis);

  // Interactive elements
  initCursor();
  initMagnetic();
  initAccordion();
  initHorizontalScroll(lenis);

  // Trigger initial reveals for above-fold content
  setTimeout(() => {
    document.querySelectorAll("#hero [data-reveal]").forEach((el) => {
      el.classList.add("revealed");
    });
  }, 100);

  console.log("Pour Haus Concrete - All modules initialized");
}
