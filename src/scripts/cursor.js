/**
 * Premium Custom Cursor Module
 * Optimized with visibility handling and magnetic effects
 */

import gsap from "gsap";

/**
 * Initialize custom cursor with performance optimizations
 */
export function initCursor() {
  // Skip on touch devices
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    const cursor = document.getElementById("cursor");
    if (cursor) cursor.style.display = "none";
    return;
  }

  const cursor = document.getElementById("cursor");
  if (!cursor) return;

  const cursorDot = cursor.querySelector(".cursor-dot");
  const cursorOutline = cursor.querySelector(".cursor-outline");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;
  let rafId = null;
  let isVisible = true;

  // Track mouse position
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Animation loop for smooth outline following
  function animate() {
    if (!isVisible) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    // Lerp for smooth following with variable speed
    const speed = 0.12;
    outlineX += (mouseX - outlineX) * speed;
    outlineY += (mouseY - outlineY) * speed;

    // Use transform for GPU acceleration
    cursorDot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
    cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0)`;

    rafId = requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Handle visibility changes (pause RAF when tab is hidden)
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;

    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId) {
      rafId = requestAnimationFrame(animate);
    }
  });

  // Handle hover states with GSAP for smooth transitions
  const hoverTargets = document.querySelectorAll(
    'a, button, [data-magnetic], input, textarea, [role="button"]',
  );

  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover");
      gsap.to(cursorOutline, {
        scale: 1.8,
        opacity: 0.6,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    target.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover");
      gsap.to(cursorOutline, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });

  // Large hover for images and cards
  const imageTargets = document.querySelectorAll(
    ".h-scroll-card, [data-parallax], .accordion-item",
  );

  imageTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover-large");
      gsap.to(cursorOutline, {
        scale: 2.5,
        borderColor: "#964B00",
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(cursorDot, {
        scale: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    target.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover-large");
      gsap.to(cursorOutline, {
        scale: 1,
        borderColor: "#FAFAFA",
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
      gsap.to(cursorDot, {
        scale: 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });

  // Click feedback
  document.addEventListener("mousedown", () => {
    gsap.to(cursorOutline, {
      scale: 0.8,
      duration: 0.15,
      ease: "power2.in",
    });
    gsap.to(cursorDot, {
      scale: 1.5,
      duration: 0.15,
      ease: "power2.in",
    });
  });

  document.addEventListener("mouseup", () => {
    gsap.to(cursorOutline, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
    gsap.to(cursorDot, {
      scale: 1,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)",
    });
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => {
    gsap.to(cursor, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    });
  });

  document.addEventListener("mouseenter", () => {
    gsap.to(cursor, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  });

  // Text selection cursor change
  document.addEventListener("selectstart", () => {
    cursor.classList.add("selecting");
    gsap.to(cursorDot, {
      width: 4,
      height: 20,
      borderRadius: 2,
      duration: 0.2,
    });
  });

  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length === 0) {
      cursor.classList.remove("selecting");
      gsap.to(cursorDot, {
        width: 8,
        height: 8,
        borderRadius: "50%",
        duration: 0.2,
      });
    }
  });
}
