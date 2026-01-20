/**
 * Magnetic Button Module
 * Premium hover effect that pulls element toward cursor
 */

import gsap from "gsap";

/**
 * Initialize magnetic effect on elements
 */
export function initMagnetic() {
  // Skip on touch devices
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    return;
  }

  const magneticElements = document.querySelectorAll("[data-magnetic]");

  magneticElements.forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
    const ease = el.dataset.magneticEase || "power2.out";

    el.addEventListener("mouseenter", () => {
      el.style.willChange = "transform";
    });

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.4,
        ease: ease,
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => {
          el.style.willChange = "";
        },
      });
    });
  });
}
