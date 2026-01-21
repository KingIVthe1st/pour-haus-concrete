/**
 * Premium Animations Module
 * Awwwards-grade GSAP animations with scroll-velocity effects
 *
 * Architecture:
 * - Custom easing curves registered with GSAP
 * - ScrollTrigger properly synced with Lenis
 * - Reduced motion preference respected
 * - Performance-optimized RAF usage
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger, CustomEase);

// ========================================
// CUSTOM EASING CURVES - Signature Motion
// ========================================
// These create the premium "feel" that separates award-winning sites
CustomEase.create("expo-out", "0.16, 1, 0.3, 1");
CustomEase.create("expo-in-out", "0.87, 0, 0.13, 1");
CustomEase.create("quint-out", "0.22, 1, 0.36, 1");
CustomEase.create("elastic-subtle", "0.68, -0.55, 0.265, 1.55");
// Premium "pour" easing - slow start, accelerate, soft landing (like liquid concrete)
CustomEase.create("pour", "0.4, 0, 0.2, 1");

// Global state
let scrollVelocity = 0;
let currentLenis = null;
let prefersReducedMotion = false;

/**
 * Initialize all scroll-based animations
 * @param {Lenis} lenis - Lenis instance for scroll sync
 */
export function initAnimations(lenis) {
  currentLenis = lenis;

  // Check reduced motion preference
  prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Listen for preference changes
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (e) => {
      prefersReducedMotion = e.matches;
    });

  // ========================================
  // CRITICAL: Sync Lenis with ScrollTrigger
  // Without this, scroll position can get out of sync
  // ========================================
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.body.style.transform ? "transform" : "fixed",
  });

  // Update ScrollTrigger on Lenis scroll
  lenis.on("scroll", ({ velocity }) => {
    scrollVelocity = velocity;
    ScrollTrigger.update();
  });

  // Ensure ScrollTrigger refreshes on resize
  ScrollTrigger.addEventListener("refresh", () => lenis.resize());

  // Wait for fonts to load before splitting text
  document.fonts.ready.then(() => {
    // Skip complex animations if reduced motion preferred
    if (prefersReducedMotion) {
      initReducedMotionAnimations();
    } else {
      initHeroOrchestration();
      initRevealAnimations();
      initParallaxAnimations();
      initVelocityBlur();
      initFooterInvert();
      initScrollProgress();
    }
  });
}

/**
 * Simplified animations for reduced motion users
 * Respects accessibility while still providing feedback
 */
function initReducedMotionAnimations() {
  // Simple fade for all reveals
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    gsap.set(el, { opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: () => gsap.to(el, { opacity: 1, duration: 0.3 }),
    });
  });

  // Show hero immediately
  const heroHeadline = document.querySelector(".hero-headline");
  if (heroHeadline) {
    gsap.to(heroHeadline, { opacity: 1, duration: 0.3 });
  }
}

/**
 * Premium Hero Orchestration
 * Multi-layered reveal with depth cues
 * Handles: LIQUID (filled) / HISTORY (outline) headline structure
 */
function initHeroOrchestration() {
  const heroHeadline = document.querySelector(".hero-headline");
  const heroLines = document.querySelectorAll(".hero-headline-line");
  const heroOverline = document.querySelector(".hero-overline");
  const heroSubheadline = document.querySelector(".hero-subheadline");
  const heroCTA = document.querySelector(".hero-cta-row");
  const scrollIndicator = document.querySelector(".scroll-indicator");
  const sideDetail = document.querySelector(".hero-side-detail");

  if (!heroHeadline) return;

  // Split each line into characters for premium stagger effect
  const splits = [];
  heroLines.forEach((line) => {
    const split = new SplitType(line, {
      types: "chars",
      tagName: "span",
    });
    splits.push(split);
  });

  // Add perspective for 3D depth
  heroHeadline.style.perspective = "1200px";
  heroHeadline.style.perspectiveOrigin = "50% 100%";

  // Set initial states - characters emerge from below with rotation
  splits.forEach((split, lineIndex) => {
    gsap.set(split.chars, {
      y: 150,
      opacity: 0,
      rotateX: -45,
      z: -100,
      transformOrigin: "center bottom",
    });
  });

  // Create master timeline with "pour" easing
  const heroTimeline = gsap.timeline({
    delay: 0.2,
    defaults: { ease: "pour" },
  });

  // Phase 1: Overline slides in
  if (heroOverline) {
    heroTimeline.fromTo(
      heroOverline,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "expo-out" },
    );
  }

  // Phase 2: First line (LIQUID) - filled text emerges
  if (splits[0]) {
    heroTimeline.to(
      splits[0].chars,
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        z: 0,
        duration: 1.2,
        stagger: {
          amount: 0.4,
          from: "start",
        },
        ease: "expo-out",
      },
      "-=0.4",
    );
  }

  // Phase 3: Second line (HISTORY) - outline text with slight delay
  if (splits[1]) {
    heroTimeline.to(
      splits[1].chars,
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        z: 0,
        duration: 1.4,
        stagger: {
          amount: 0.5,
          from: "start",
        },
        ease: "expo-out",
      },
      "-=0.8",
    );
  }

  // Phase 4: Subheadline with blur reveal
  if (heroSubheadline) {
    heroTimeline.fromTo(
      heroSubheadline,
      {
        y: 60,
        opacity: 0,
        filter: "blur(12px)",
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "quint-out",
      },
      "-=0.6",
    );
  }

  // Phase 5: CTA buttons slide up
  if (heroCTA) {
    heroTimeline.fromTo(
      heroCTA,
      {
        y: 40,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "expo-out",
      },
      "-=0.5",
    );
  }

  // Phase 6: Scroll indicator + side detail fade in
  if (scrollIndicator) {
    heroTimeline.fromTo(
      scrollIndicator,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3",
    );
  }

  if (sideDetail) {
    heroTimeline.fromTo(
      sideDetail,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.8, ease: "expo-out" },
      "-=0.5",
    );
  }

  // Interactive: Characters react to hover
  splits.forEach((split) => {
    split.chars.forEach((char) => {
      char.addEventListener("mouseenter", () => {
        gsap.to(char, {
          y: -8,
          scale: 1.15,
          duration: 0.25,
          ease: "power2.out",
        });
      });
      char.addEventListener("mouseleave", () => {
        gsap.to(char, {
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "elastic-subtle",
        });
      });
    });
  });

  // Parallax effect on scroll - headline moves slower than scroll
  ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      gsap.set(heroHeadline, {
        y: progress * 100,
        opacity: 1 - progress * 0.5,
      });
    },
  });
}

/**
 * Scroll-triggered reveal animations with temporal variety
 * Uses gsap.matchMedia for responsive animation values
 */
function initRevealAnimations() {
  const reveals = document.querySelectorAll("[data-reveal]");

  // Use matchMedia for responsive animation values
  // Mobile: smaller Y offset (30px) to prevent overlap
  // Desktop: larger Y offset (60-80px) for dramatic effect
  const mm = gsap.matchMedia();

  mm.add(
    {
      isMobile: "(max-width: 768px)",
      isDesktop: "(min-width: 769px)",
    },
    (context) => {
      const { isMobile } = context.conditions;

      reveals.forEach((el, index) => {
        // Skip hero elements (handled separately)
        if (el.closest("#hero")) return;

        // Vary animation properties for temporal diversity
        const delay = parseFloat(el.dataset.revealDelay) || 0;
        const isHeading =
          el.tagName.match(/^H[1-6]$/) ||
          el.classList.contains("heading-section");

        // Responsive Y offset: Mobile uses smaller values to prevent overlap
        const yOffset = isMobile ? 30 : isHeading ? 80 : 60;
        // Reduce blur on mobile for better performance and cleaner edges
        const blurAmount = isMobile ? "blur(4px)" : "blur(8px)";

        // Set initial state with responsive values
        gsap.set(el, {
          y: yOffset,
          opacity: 0,
          filter: blurAmount,
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
              y: yOffset,
              opacity: 0,
              filter: blurAmount,
              duration: 0.4,
              ease: "power2.in",
            });
          },
        });
      });

      // Return cleanup function for matchMedia
      return () => {
        // ScrollTrigger instances are automatically cleaned up by matchMedia
      };
    },
  );
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
 * Scroll-velocity motion effect
 * Uses GPU-accelerated transforms instead of expensive filter: blur()
 * Creates subtle skew effect during fast scroll for "motion" feel
 */
function initVelocityBlur() {
  const motionTargets = document.querySelectorAll(
    ".heading-hero, .heading-section, .h-scroll-card img",
  );

  // Pre-set will-change for GPU compositing
  motionTargets.forEach((target) => {
    target.style.willChange = "transform";
    target.style.backfaceVisibility = "hidden";
  });

  // State for smooth interpolation
  const motionProxy = { skew: 0 };

  // Update motion effect based on scroll velocity
  gsap.ticker.add(() => {
    // Calculate target skew (capped for subtlety)
    const targetSkew = Math.max(-2, Math.min(scrollVelocity * 0.15, 2));

    // Smooth interpolation toward target
    motionProxy.skew += (targetSkew - motionProxy.skew) * 0.12;

    // Only apply transforms when there's meaningful motion
    if (Math.abs(motionProxy.skew) > 0.01) {
      motionTargets.forEach((target) => {
        // Use skewY for vertical scroll motion feel (GPU-accelerated)
        target.style.transform = `skewY(${motionProxy.skew}deg)`;
      });
    } else {
      // Clear transforms when static
      motionTargets.forEach((target) => {
        target.style.transform = "";
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
