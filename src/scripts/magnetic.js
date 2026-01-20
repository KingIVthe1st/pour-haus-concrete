/**
 * Premium Magnetic Button Module
 * Awwwards-grade hover effect with child offset, 3D tilt, and shine
 *
 * Features:
 * - Button pulls toward cursor on hover
 * - Child text/content moves with offset for "liquid" feel
 * - Subtle 3D tilt rotation
 * - Shine highlight effect on movement
 * - GPU-accelerated transforms
 * - Configurable via data attributes
 */

import gsap from "gsap";

/**
 * Initialize magnetic effect on elements with [data-magnetic]
 *
 * Data attributes:
 * - data-magnetic          Required. Enables effect.
 * - data-magnetic-strength Multiplier for pull strength (default: 0.3)
 * - data-magnetic-ease     GSAP ease for animation (default: "power2.out")
 * - data-magnetic-tilt     Enable 3D tilt (default: true)
 * - data-magnetic-shine    Enable shine effect (default: true)
 */
export function initMagnetic() {
  // Skip on touch devices
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    return;
  }

  const magneticElements = document.querySelectorAll("[data-magnetic]");

  magneticElements.forEach((el) => {
    // Parse configuration from data attributes
    const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
    const childStrength = strength * 0.6; // Children move less for offset
    const ease = el.dataset.magneticEase || "power2.out";
    const enableTilt = el.dataset.magneticTilt !== "false";
    const enableShine = el.dataset.magneticShine !== "false";

    // Get child elements (text, icons, etc.)
    const children = el.querySelectorAll(
      "span, .btn-text, .btn-icon, svg, i, .magnetic-child",
    );

    // Create shine overlay if enabled
    let shine = null;
    if (enableShine) {
      shine = createShineElement(el);
    }

    // Track state
    let isHovering = false;
    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Smooth animation loop for fluid motion
    function updatePosition() {
      if (!isHovering) {
        // Return to center with spring
        targetX = 0;
        targetY = 0;
      }

      // Smooth lerp
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      // Apply transform to element
      const tiltX = enableTilt ? currentY * 0.1 : 0;
      const tiltY = enableTilt ? -currentX * 0.1 : 0;

      gsap.set(el, {
        x: currentX,
        y: currentY,
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
      });

      // Apply offset transform to children (creates "liquid" feel)
      if (children.length > 0) {
        const childOffsetX = currentX * childStrength;
        const childOffsetY = currentY * childStrength;

        children.forEach((child) => {
          gsap.set(child, {
            x: childOffsetX,
            y: childOffsetY,
          });
        });
      }

      // Update shine position
      if (shine) {
        updateShine(shine, currentX, currentY, el);
      }

      // Continue loop if not back at center
      if (
        Math.abs(currentX) > 0.1 ||
        Math.abs(currentY) > 0.1 ||
        Math.abs(targetX) > 0.1 ||
        Math.abs(targetY) > 0.1
      ) {
        rafId = requestAnimationFrame(updatePosition);
      } else {
        rafId = null;
        // Clean up - reset all transforms
        if (!isHovering) {
          gsap.set(el, { clearProps: "x,y,rotateX,rotateY" });
          children.forEach((child) => {
            gsap.set(child, { clearProps: "x,y" });
          });
        }
      }
    }

    // Mouse enter - start effect
    el.addEventListener("mouseenter", () => {
      isHovering = true;
      el.style.willChange = "transform";

      // Start animation loop if not running
      if (!rafId) {
        rafId = requestAnimationFrame(updatePosition);
      }

      // Show shine
      if (shine) {
        gsap.to(shine, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      // Subtle scale up
      gsap.to(el, {
        scale: 1.02,
        duration: 0.4,
        ease: ease,
      });
    });

    // Mouse move - update target position
    el.addEventListener("mousemove", (e) => {
      if (!isHovering) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate offset from center
      targetX = (e.clientX - centerX) * strength;
      targetY = (e.clientY - centerY) * strength;

      // Start animation if not running
      if (!rafId) {
        rafId = requestAnimationFrame(updatePosition);
      }
    });

    // Mouse leave - return to center
    el.addEventListener("mouseleave", () => {
      isHovering = false;

      // Hide shine
      if (shine) {
        gsap.to(shine, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }

      // Spring back to center
      gsap.to(el, {
        scale: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
          el.style.willChange = "";
        },
      });

      // Ensure animation loop runs to completion
      if (!rafId) {
        rafId = requestAnimationFrame(updatePosition);
      }
    });

    // Mouse down - press effect
    el.addEventListener("mousedown", () => {
      gsap.to(el, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.in",
      });
    });

    // Mouse up - release
    el.addEventListener("mouseup", () => {
      gsap.to(el, {
        scale: 1.02,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });
}

/**
 * Create shine overlay element
 */
function createShineElement(parent) {
  // Check if shine already exists
  let shine = parent.querySelector(".magnetic-shine");
  if (shine) return shine;

  shine = document.createElement("span");
  shine.className = "magnetic-shine";
  shine.setAttribute("aria-hidden", "true");
  shine.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle 80px at var(--shine-x, 50%) var(--shine-y, 50%),
      rgba(255, 255, 255, 0.15) 0%,
      transparent 100%
    );
    pointer-events: none;
    opacity: 0;
    border-radius: inherit;
    overflow: hidden;
    z-index: 1;
  `;

  // Ensure parent has relative positioning
  const parentPosition = window.getComputedStyle(parent).position;
  if (parentPosition === "static") {
    parent.style.position = "relative";
  }

  parent.appendChild(shine);
  return shine;
}

/**
 * Update shine position based on mouse movement
 */
function updateShine(shine, x, y, parent) {
  const rect = parent.getBoundingClientRect();

  // Convert offset to percentage
  const percentX = 50 + (x / rect.width) * 100;
  const percentY = 50 + (y / rect.height) * 100;

  shine.style.setProperty("--shine-x", `${percentX}%`);
  shine.style.setProperty("--shine-y", `${percentY}%`);
}

/**
 * Utility: Add magnetic effect to an element programmatically
 */
export function addMagnetic(element, options = {}) {
  const defaults = {
    strength: 0.3,
    ease: "power2.out",
    tilt: true,
    shine: true,
  };

  const config = { ...defaults, ...options };

  element.setAttribute("data-magnetic", "");
  element.setAttribute("data-magnetic-strength", config.strength);
  element.setAttribute("data-magnetic-ease", config.ease);
  element.setAttribute("data-magnetic-tilt", config.tilt);
  element.setAttribute("data-magnetic-shine", config.shine);

  // Re-initialize to pick up new element
  initMagnetic();
}
