/**
 * Premium Animations Module
 * Awwwards-grade GSAP animations with scroll-velocity effects
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

// Global state for scroll velocity
let scrollVelocity = 0;
let currentLenis = null;

/**
 * Initialize all scroll-based animations
 * @param {Lenis} lenis - Lenis instance for scroll sync
 */
export function initAnimations(lenis) {
  currentLenis = lenis;

  // Track scroll velocity for effects
  lenis.on("scroll", ({ velocity }) => {
    scrollVelocity = velocity;
  });

  // Wait for fonts to load before splitting text
  document.fonts.ready.then(() => {
    initHeroOrchestration();
    initRevealAnimations();
    initParallaxAnimations();
    initVelocityBlur();
    initFooterInvert();
    initScrollProgress();
  });
}

/**
 * Premium Hero Orchestration
 * Multi-layered reveal with depth cues
 */
function initHeroOrchestration() {
  const heroText = document.querySelector("[data-split-text]");
  const heroSubtext = document.querySelector("#hero .text-mono-detail");
  const scrollIndicator = document.querySelector(".scroll-indicator");

  if (!heroText) return;

  // Split text into characters with wrapper for 3D
  const split = new SplitType(heroText, {
    types: "chars",
    tagName: "span",
  });

  // Add perspective container for 3D depth
  heroText.style.perspective = "1000px";
  heroText.style.perspectiveOrigin = "50% 50%";

  // Set initial state - further back in Z-space
  gsap.set(split.chars, {
    y: 120,
    opacity: 0,
    rotateX: -90,
    z: -200,
    transformOrigin: "center bottom",
  });

  // Create master timeline for orchestrated reveal
  const heroTimeline = gsap.timeline({
    delay: 0.3,
    defaults: { ease: "expo.out" },
  });

  // Phase 1: Characters emerge from depth
  heroTimeline.to(split.chars, {
    y: 0,
    opacity: 1,
    rotateX: 0,
    z: 0,
    duration: 1.4,
    stagger: {
      amount: 0.6,
      from: "start",
    },
  });

  // Phase 2: Subtle overshoot and settle
  heroTimeline.to(
    split.chars,
    {
      y: -8,
      duration: 0.3,
      stagger: {
        amount: 0.2,
        from: "start",
      },
    },
    "-=0.4",
  );

  heroTimeline.to(
    split.chars,
    {
      y: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
      stagger: {
        amount: 0.2,
        from: "start",
      },
    },
    "-=0.1",
  );

  // Phase 3: Subtext fades in
  if (heroSubtext) {
    heroTimeline.fromTo(
      heroSubtext,
      {
        y: 40,
        opacity: 0,
        filter: "blur(10px)",
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
      },
      "-=0.8",
    );
  }

  // Phase 4: Scroll indicator appears
  if (scrollIndicator) {
    heroTimeline.fromTo(
      scrollIndicator,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.4",
    );
  }

  // Add subtle hover parallax to hero chars
  split.chars.forEach((char, i) => {
    char.addEventListener("mouseenter", () => {
      gsap.to(char, {
        y: -5,
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    char.addEventListener("mouseleave", () => {
      gsap.to(char, {
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });
}

/**
 * Scroll-triggered reveal animations with temporal variety
 */
function initRevealAnimations() {
  const reveals = document.querySelectorAll("[data-reveal]");

  reveals.forEach((el, index) => {
    // Skip hero elements (handled separately)
    if (el.closest("#hero")) return;

    // Vary animation properties for temporal diversity
    const delay = parseFloat(el.dataset.revealDelay) || 0;
    const isHeading =
      el.tagName.match(/^H[1-6]$/) || el.classList.contains("heading-section");

    // Set initial state with blur for premium feel
    gsap.set(el, {
      y: isHeading ? 80 : 60,
      opacity: 0,
      filter: "blur(8px)",
    });

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      onEnter: () => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: isHeading ? 1.2 : 0.9,
          delay: delay * 0.15,
          ease: "expo.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(el, {
          y: isHeading ? 80 : 60,
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.4,
          ease: "power2.in",
        });
      },
    });
  });
}

/**
 * Enhanced parallax with depth layers
 */
function initParallaxAnimations() {
  const parallaxElements = document.querySelectorAll("[data-parallax]");

  parallaxElements.forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxSpeed) || 0.2;
    const img = el.querySelector("img");

    // Scale image slightly for parallax overflow
    if (img) {
      gsap.set(img, { scale: 1.15 });
    }

    gsap.to(el, {
      yPercent: -20 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  });
}

/**
 * Scroll-velocity blur effect
 * Elements blur slightly during fast scroll
 */
function initVelocityBlur() {
  const blurTargets = document.querySelectorAll(
    ".heading-hero, .heading-section, .h-scroll-card img",
  );

  // Create blur proxy for smooth animation
  const blurProxy = { blur: 0 };

  // Update blur based on scroll velocity
  gsap.ticker.add(() => {
    const targetBlur = Math.min(Math.abs(scrollVelocity) * 0.5, 4);

    // Smooth interpolation
    blurProxy.blur += (targetBlur - blurProxy.blur) * 0.1;

    // Apply blur only when moving fast enough
    if (blurProxy.blur > 0.1) {
      blurTargets.forEach((target) => {
        target.style.filter = `blur(${blurProxy.blur}px)`;
      });
    } else {
      blurTargets.forEach((target) => {
        target.style.filter = "";
      });
    }
  });
}

/**
 * Footer reveal with color inversion
 */
function initFooterInvert() {
  const footer = document.getElementById("contact");
  if (!footer) return;

  // Create dramatic entrance
  const footerHeading = footer.querySelector(".heading-hero");
  const footerElements = footer.querySelectorAll("[data-reveal]");

  if (footerHeading) {
    // Split footer heading for staggered reveal
    const footerSplit = new SplitType(footerHeading, {
      types: "chars",
      tagName: "span",
    });

    gsap.set(footerSplit.chars, {
      y: 100,
      opacity: 0,
    });

    ScrollTrigger.create({
      trigger: footer,
      start: "top 70%",
      onEnter: () => {
        gsap.to(footerSplit.chars, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          stagger: {
            amount: 0.5,
            from: "start",
          },
        });
      },
    });
  }

  // Stagger other footer elements
  ScrollTrigger.create({
    trigger: footer,
    start: "top 80%",
    onEnter: () => {
      footerElements.forEach((el, i) => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.8,
          delay: 0.3 + i * 0.1,
          ease: "power3.out",
        });
      });
    },
  });
}

/**
 * Scroll progress indicator (subtle line at top)
 */
function initScrollProgress() {
  // Create progress bar element
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg, #964B00, #FAFAFA);
    transform-origin: left;
    transform: scaleX(0);
    z-index: 9999;
    pointer-events: none;
  `;
  document.body.appendChild(progressBar);

  // Animate on scroll
  gsap.to(progressBar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.3,
    },
  });
}

/**
 * Utility: Refresh all ScrollTrigger instances
 * Call after dynamic content changes
 */
export function refreshAnimations() {
  ScrollTrigger.refresh();
}

/**
 * Utility: Get current scroll velocity
 */
export function getScrollVelocity() {
  return scrollVelocity;
}
