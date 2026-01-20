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
import { initMobileMenu } from "./scripts/mobile-menu.js";
import { initHeroShader } from "./scripts/hero-shader.js";

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  // Initialize loading sequence
  initLoader();
});

/**
 * Premium Loading Sequence - PSI Gauge
 * Simulates concrete pressure building to 4000 PSI
 */
function initLoader() {
  const loader = document.getElementById("loader");
  const psiDisplay = document.getElementById("loader-psi");
  const stageDisplay = document.getElementById("loader-stage");
  const progressBar = document.getElementById("loader-progress-bar");
  const tagline = document.getElementById("loader-tagline");

  // Loading stages with their PSI thresholds
  const stages = [
    { psi: 0, label: "MIXING", duration: 800 },
    { psi: 1000, label: "POURING", duration: 600 },
    { psi: 2500, label: "CURING", duration: 700 },
    { psi: 4000, label: "READY", duration: 400 },
  ];

  const targetPSI = 4000;
  const totalDuration = 2500; // Total animation time in ms
  let currentPSI = 0;
  let startTime = null;

  // Custom easing function - starts slow, accelerates, then slows at end
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  // Animation loop for PSI counter
  function animatePSI(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const easedProgress = easeOutExpo(progress);

    // Calculate current PSI
    currentPSI = Math.floor(easedProgress * targetPSI);

    // Update display
    if (psiDisplay) {
      psiDisplay.textContent = currentPSI;
      // Update ARIA for accessibility
      loader.setAttribute("aria-valuenow", Math.floor(progress * 100));
    }

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    // Update stage based on PSI
    if (stageDisplay) {
      for (let i = stages.length - 1; i >= 0; i--) {
        if (currentPSI >= stages[i].psi) {
          stageDisplay.textContent = stages[i].label;
          break;
        }
      }
    }

    // Show tagline near end
    if (progress > 0.7 && tagline) {
      tagline.classList.add("visible");
    }

    // Fill the number when reaching max
    if (progress > 0.9 && psiDisplay) {
      psiDisplay.classList.add("filled");
    }

    // Continue or complete
    if (progress < 1) {
      requestAnimationFrame(animatePSI);
    } else {
      // Animation complete - wait for resources then hide loader
      completeLoading();
    }
  }

  // Wait for critical resources then start animation
  Promise.all([document.fonts.ready, loadCriticalImages()]).then(() => {
    requestAnimationFrame(animatePSI);
  });

  // Complete loading and reveal site
  function completeLoading() {
    // Short pause at 4000 PSI before reveal
    setTimeout(() => {
      loader.classList.add("hidden");
      initAllModules();
    }, 400);
  }
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
  initMobileMenu();

  // Premium visual effects
  initHeroShader(lenis);

  // Trigger initial reveals for above-fold content
  setTimeout(() => {
    document.querySelectorAll("#hero [data-reveal]").forEach((el) => {
      el.classList.add("revealed");
    });
  }, 100);

  console.log("Pour Haus Concrete - All modules initialized");
}
