/**
 * Premium Custom Cursor Module
 * Awwwards-grade cursor with blend modes, text labels, velocity morphing
 *
 * Features:
 * - Blend mode for visibility on any background
 * - Contextual text labels ("View", "Drag", "Explore")
 * - Velocity-based stretching
 * - "Stuck" mode for magnetic elements
 * - Performance optimized with RAF and visibility API
 */

import gsap from "gsap";

// Cursor text labels for different contexts
const CURSOR_LABELS = {
  card: "View",
  drag: "Drag",
  link: "→",
  video: "Play",
  image: "Explore",
};

/**
 * Initialize custom cursor with all premium effects
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

  // Create cursor text element for labels
  let cursorText = cursor.querySelector(".cursor-text");
  if (!cursorText) {
    cursorText = document.createElement("span");
    cursorText.className = "cursor-text";
    cursorText.setAttribute("aria-hidden", "true");
    cursor.appendChild(cursorText);
  }

  // State management
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let prevMouseX = mouseX;
  let prevMouseY = mouseY;
  let outlineX = mouseX;
  let outlineY = mouseY;
  let rafId = null;
  let isVisible = true;
  let isStuck = false;
  let stuckTarget = null;
  let velocity = { x: 0, y: 0 };

  // Track mouse position with velocity
  document.addEventListener("mousemove", (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Calculate velocity for morphing
    velocity.x = mouseX - prevMouseX;
    velocity.y = mouseY - prevMouseY;
  });

  // Animation loop with velocity-based morphing
  function animate() {
    if (!isVisible) {
      rafId = requestAnimationFrame(animate);
      return;
    }

    // Lerp for smooth following
    const speed = isStuck ? 0.2 : 0.12;
    outlineX += (mouseX - outlineX) * speed;
    outlineY += (mouseY - outlineY) * speed;

    // Stuck mode - cursor follows magnetic element
    if (isStuck && stuckTarget) {
      const rect = stuckTarget.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      outlineX += (targetX - outlineX) * 0.15;
      outlineY += (targetY - outlineY) * 0.15;
    }

    // Velocity-based stretching (subtle effect)
    const velocityStrength = Math.sqrt(
      velocity.x * velocity.x + velocity.y * velocity.y,
    );
    const maxStretch = 1.3;
    const stretchAmount = Math.min(velocityStrength * 0.02, maxStretch - 1);
    const stretchAngle = Math.atan2(velocity.y, velocity.x);

    // Apply transforms
    cursorDot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;

    // Outline with velocity stretching
    const scaleX = 1 + stretchAmount * Math.abs(Math.cos(stretchAngle));
    const scaleY = 1 + stretchAmount * Math.abs(Math.sin(stretchAngle));
    const rotation = stretchAngle * (180 / Math.PI);

    if (velocityStrength > 2 && !isStuck) {
      cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
    } else {
      cursorOutline.style.transform = `translate3d(${outlineX - 20}px, ${outlineY - 20}px, 0)`;
    }

    // Decay velocity
    velocity.x *= 0.9;
    velocity.y *= 0.9;

    rafId = requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  // Handle visibility changes
  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;

    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (!document.hidden && !rafId) {
      rafId = requestAnimationFrame(animate);
    }
  });

  // ========================================
  // HOVER STATES WITH CONTEXTUAL LABELS
  // ========================================

  // Standard hover targets (links, buttons)
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

  // Card hover - "View" label
  const cardTargets = document.querySelectorAll(
    ".h-scroll-card, .accordion-item",
  );

  cardTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover-text");
      showCursorText(CURSOR_LABELS.card);
      gsap.to(cursorOutline, {
        scale: 3,
        borderColor: "transparent",
        backgroundColor: "rgba(250, 250, 250, 0.1)",
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
      cursor.classList.remove("hover-text");
      hideCursorText();
      gsap.to(cursorOutline, {
        scale: 1,
        borderColor: "#FAFAFA",
        backgroundColor: "transparent",
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

  // Image hover - "Explore" label
  const imageTargets = document.querySelectorAll(
    "[data-parallax], .service-image",
  );

  imageTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover-text");
      showCursorText(CURSOR_LABELS.image);
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
      cursor.classList.remove("hover-text");
      hideCursorText();
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

  // Horizontal scroll section - "Drag" label
  const dragTargets = document.querySelectorAll(".h-scroll-section");

  dragTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover-drag");
      showCursorText(CURSOR_LABELS.drag);
    });
    target.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover-drag");
      hideCursorText();
    });
  });

  // ========================================
  // MAGNETIC "STUCK" MODE
  // ========================================
  const magneticTargets = document.querySelectorAll("[data-magnetic]");

  magneticTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      isStuck = true;
      stuckTarget = target;
      cursor.classList.add("stuck");

      gsap.to(cursorOutline, {
        scale: 2.2,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    target.addEventListener("mouseleave", () => {
      isStuck = false;
      stuckTarget = null;
      cursor.classList.remove("stuck");

      gsap.to(cursorOutline, {
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    });
  });

  // ========================================
  // CLICK FEEDBACK
  // ========================================
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

  // ========================================
  // WINDOW ENTER/LEAVE
  // ========================================
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

  // ========================================
  // TEXT SELECTION MODE
  // ========================================
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

  // ========================================
  // CURSOR TEXT HELPERS
  // ========================================
  function showCursorText(text) {
    cursorText.textContent = text;
    gsap.to(cursorText, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  function hideCursorText() {
    gsap.to(cursorText, {
      opacity: 0,
      scale: 0.8,
      duration: 0.2,
      ease: "power2.in",
    });
  }
}
