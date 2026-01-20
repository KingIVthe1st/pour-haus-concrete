/**
 * Mobile Menu Module
 * Accessible hamburger menu with focus trap
 */

/**
 * Initialize mobile menu with full accessibility
 */
export function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  // Only initialize if both elements exist
  if (!menuBtn) return;

  // Create mobile menu if it doesn't exist
  if (!mobileMenu) {
    createMobileMenu();
  }

  const menu = document.getElementById("mobile-menu");
  if (!menu) return;

  const closeBtn = menu.querySelector(".mobile-menu-close");
  const navLinks = menu.querySelectorAll("a");
  let isOpen = false;

  // Toggle menu
  function toggleMenu() {
    isOpen = !isOpen;
    menu.classList.toggle("open", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen.toString());

    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = "hidden";
      // Focus first link after animation
      setTimeout(() => {
        closeBtn?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
      menuBtn.focus();
    }
  }

  // Close menu
  function closeMenu() {
    if (isOpen) {
      isOpen = false;
      menu.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      menuBtn.focus();
    }
  }

  // Event listeners
  menuBtn.addEventListener("click", toggleMenu);

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  // Close on link click
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeMenu();
    }
  });

  // Focus trap within menu
  menu.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !isOpen) return;

    const focusableElements = menu.querySelectorAll(
      'button, a[href], [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}

/**
 * Create mobile menu DOM structure
 */
function createMobileMenu() {
  const menu = document.createElement("div");
  menu.id = "mobile-menu";
  menu.className = "mobile-menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Mobile navigation");

  menu.innerHTML = `
    <div class="mobile-menu-content">
      <button class="mobile-menu-close" aria-label="Close navigation menu">
        <span aria-hidden="true">&times;</span>
      </button>
      <nav class="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <ul class="mobile-nav-list">
          <li><a href="#works" class="mobile-nav-link">The Evidence</a></li>
          <li><a href="#process" class="mobile-nav-link">Methodology</a></li>
          <li><a href="#contact" class="mobile-nav-link">Lay Foundation</a></li>
        </ul>
      </nav>
      <div class="mobile-menu-footer">
        <p class="font-mono text-xs uppercase tracking-ultra text-gray-light">Est. 1985 — Atlanta, GA</p>
      </div>
    </div>
  `;

  document.body.appendChild(menu);
}
