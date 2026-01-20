/**
 * Accordion Module
 * Services section with image hover reveal
 * Full ARIA accessibility support
 */

/**
 * Initialize accordion functionality with accessibility
 */
export function initAccordion() {
  const accordionItems = document.querySelectorAll(".accordion-item");
  const serviceImages = document.querySelectorAll(".service-image");

  accordionItems.forEach((item, index) => {
    const header = item.querySelector(".accordion-header");
    const content = item.querySelector(".accordion-content");
    const serviceName = item.dataset.service;

    // Generate unique IDs for ARIA relationships
    const headerId = `accordion-header-${index}`;
    const contentId = `accordion-content-${index}`;

    // Set up ARIA attributes
    header.setAttribute("role", "button");
    header.setAttribute("aria-expanded", "false");
    header.setAttribute("aria-controls", contentId);
    header.setAttribute("id", headerId);
    header.setAttribute("tabindex", "0");

    if (content) {
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", headerId);
      content.setAttribute("id", contentId);
      content.setAttribute("aria-hidden", "true");
    }

    // Toggle function with ARIA updates
    const toggleAccordion = (activate = null) => {
      const isActive = item.classList.contains("active");
      const shouldActivate = activate !== null ? activate : !isActive;

      // Close all items and update their ARIA
      accordionItems.forEach((i) => {
        i.classList.remove("active");
        const h = i.querySelector(".accordion-header");
        const c = i.querySelector(".accordion-content");
        if (h) h.setAttribute("aria-expanded", "false");
        if (c) c.setAttribute("aria-hidden", "true");
      });

      // Open clicked item if it wasn't active
      if (shouldActivate) {
        item.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        if (content) content.setAttribute("aria-hidden", "false");
      }
    };

    // Click to expand/collapse
    header.addEventListener("click", () => toggleAccordion());

    // Keyboard navigation
    header.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          toggleAccordion();
          break;
        case "ArrowDown":
          e.preventDefault();
          focusNextAccordion(index, accordionItems);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusPrevAccordion(index, accordionItems);
          break;
        case "Home":
          e.preventDefault();
          focusFirstAccordion(accordionItems);
          break;
        case "End":
          e.preventDefault();
          focusLastAccordion(accordionItems);
          break;
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

/**
 * Focus next accordion header
 */
function focusNextAccordion(currentIndex, items) {
  const nextIndex = (currentIndex + 1) % items.length;
  const nextHeader = items[nextIndex].querySelector(".accordion-header");
  if (nextHeader) nextHeader.focus();
}

/**
 * Focus previous accordion header
 */
function focusPrevAccordion(currentIndex, items) {
  const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
  const prevHeader = items[prevIndex].querySelector(".accordion-header");
  if (prevHeader) prevHeader.focus();
}

/**
 * Focus first accordion header
 */
function focusFirstAccordion(items) {
  const firstHeader = items[0]?.querySelector(".accordion-header");
  if (firstHeader) firstHeader.focus();
}

/**
 * Focus last accordion header
 */
function focusLastAccordion(items) {
  const lastHeader =
    items[items.length - 1]?.querySelector(".accordion-header");
  if (lastHeader) lastHeader.focus();
}
