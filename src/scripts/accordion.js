/**
 * Accordion Module
 * Services section with image hover reveal
 */

/**
 * Initialize accordion functionality
 */
export function initAccordion() {
  const accordionItems = document.querySelectorAll(".accordion-item");
  const serviceImages = document.querySelectorAll(".service-image");

  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header");
    const serviceName = item.dataset.service;

    // Click to expand/collapse
    header.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all items
      accordionItems.forEach((i) => i.classList.remove("active"));

      // Open clicked item if it wasn't active
      if (!isActive) {
        item.classList.add("active");
      }
    });

    // Hover to show image (desktop only)
    if (window.matchMedia("(min-width: 1024px)").matches) {
      item.addEventListener("mouseenter", () => {
        // Hide all images
        serviceImages.forEach((img) => img.classList.remove("visible"));

        // Show matching image
        const targetImage = document.getElementById(
          `service-image-${serviceName}`,
        );
        if (targetImage) {
          targetImage.classList.add("visible");
        }
      });

      item.addEventListener("mouseleave", () => {
        // Hide all images with delay for smooth transition
        setTimeout(() => {
          const hovered = document.querySelector(".accordion-item:hover");
          if (!hovered) {
            serviceImages.forEach((img) => img.classList.remove("visible"));
          }
        }, 100);
      });
    }
  });

  // Track mouse Y position for image following
  if (window.matchMedia("(min-width: 1024px)").matches) {
    document.addEventListener("mousemove", (e) => {
      serviceImages.forEach((img) => {
        if (img.classList.contains("visible")) {
          const rect = img.getBoundingClientRect();
          const centerY = window.innerHeight / 2;
          const offset = (e.clientY - centerY) * 0.1;

          img.style.transform = `translateY(calc(-50% + ${offset}px))`;
        }
      });
    });
  }
}
