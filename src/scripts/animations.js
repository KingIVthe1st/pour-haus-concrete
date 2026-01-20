/**
 * Animations Module
 * GSAP ScrollTrigger animations for reveals and parallax
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize all scroll-based animations
 * @param {Lenis} lenis - Lenis instance for scroll sync
 */
export function initAnimations(lenis) {
  // Wait for fonts to load before splitting text
  document.fonts.ready.then(() => {
    initHeroAnimation();
    initRevealAnimations();
    initParallaxAnimations();
    initFooterInvert();
  });
}

/**
 * Hero text split animation
 */
function initHeroAnimation() {
  const heroText = document.querySelector("[data-split-text]");
  if (!heroText) return;

  // Split text into characters
  const split = new SplitType(heroText, {
    types: "chars",
    tagName: "span",
  });

  // Set initial state
  gsap.set(split.chars, {
    y: 100,
    opacity: 0,
    rotateX: -40,
  });

  // Animate in with stagger
  gsap.to(split.chars, {
    y: 0,
    opacity: 1,
    rotateX: 0,
    duration: 1.2,
    ease: "power4.out",
    stagger: 0.03,
    delay: 0.5,
  });
}

/**
 * Scroll-triggered reveal animations
 */
function initRevealAnimations() {
  const reveals = document.querySelectorAll("[data-reveal]");

  reveals.forEach((el) => {
    // Skip hero elements (handled separately)
    if (el.closest("#hero")) return;

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => {
        el.classList.add("revealed");
      },
      onLeaveBack: () => {
        el.classList.remove("revealed");
      },
    });
  });
}

/**
 * Parallax effect for images
 */
function initParallaxAnimations() {
  const parallaxElements = document.querySelectorAll("[data-parallax]");

  parallaxElements.forEach((el) => {
    gsap.to(el, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  });
}

/**
 * Footer background color inversion
 */
function initFooterInvert() {
  const footer = document.getElementById("contact");
  if (!footer) return;

  // The footer already has white bg in HTML
  // Add subtle entrance animation
  ScrollTrigger.create({
    trigger: footer,
    start: "top 80%",
    onEnter: () => {
      footer.querySelectorAll("[data-reveal]").forEach((el, i) => {
        setTimeout(() => {
          el.classList.add("revealed");
        }, i * 100);
      });
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
