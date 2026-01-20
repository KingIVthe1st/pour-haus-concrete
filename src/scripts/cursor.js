/**
 * Custom Cursor Module
 * Premium cursor with blend mode
 */

/**
 * Initialize custom cursor
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

  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  // Track mouse position
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Animation loop for smooth outline following
  function animate() {
    // Lerp for smooth following
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    // Apply transforms
    cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    cursorOutline.style.transform = `translate(${outlineX - 20}px, ${outlineY - 20}px)`;

    requestAnimationFrame(animate);
  }
  animate();

  // Handle hover states
  const hoverTargets = document.querySelectorAll("a, button, [data-magnetic]");

  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover");
    });
    target.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover");
    });
  });

  // Large hover for images
  const imageTargets = document.querySelectorAll(
    ".h-scroll-card, [data-parallax]",
  );

  imageTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      cursor.classList.add("hover-large");
    });
    target.addEventListener("mouseleave", () => {
      cursor.classList.remove("hover-large");
    });
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}
