/**
 * Horizontal Scroll Module
 * Works gallery with smart desktop/mobile handling
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize horizontal scroll gallery
 * Desktop: scroll-hijack with GSAP
 * Mobile: native horizontal scroll with snap
 * @param {Lenis} lenis - Lenis instance
 */
export function initHorizontalScroll(lenis) {
  const section = document.querySelector(".h-scroll-section");
  const container = document.querySelector(".h-scroll-container");
  const track = document.querySelector(".h-scroll-track");

  if (!section || !container || !track) return;

  // Check if mobile/touch device
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (isMobile || isTouch) {
    initMobileScroll(section, container, track);
  } else {
    initDesktopScroll(section, container, track, lenis);
  }
}

/**
 * Mobile: Native horizontal scroll with snap points
 */
function initMobileScroll(section, container, track) {
  // Enable native horizontal scroll
  container.style.overflowX = "auto";
  container.style.overflowY = "hidden";
  container.style.scrollSnapType = "x mandatory";
  container.style.WebkitOverflowScrolling = "touch";

  // Add snap points to cards
  const cards = track.querySelectorAll(".h-scroll-card");
  cards.forEach((card) => {
    card.style.scrollSnapAlign = "start";
    card.style.scrollSnapStop = "always";
  });

  // Hide scrollbar but keep functionality
  container.style.scrollbarWidth = "none";
  container.style.msOverflowStyle = "none";

  // Add scroll progress indicator for mobile
  const progressDots = document.createElement("div");
  progressDots.className = "scroll-dots";
  progressDots.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    padding-bottom: 16px;
  `;

  cards.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${i === 0 ? "#964B00" : "#3A3A3A"};
      transition: background 0.3s ease;
    `;
    dot.dataset.index = i;
    progressDots.appendChild(dot);
  });

  section.appendChild(progressDots);

  // Update dots on scroll
  container.addEventListener("scroll", () => {
    const scrollLeft = container.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 32; // card + gap
    const activeIndex = Math.round(scrollLeft / cardWidth);

    progressDots.querySelectorAll("div").forEach((dot, i) => {
      dot.style.background = i === activeIndex ? "#964B00" : "#3A3A3A";
    });
  });

  // Add reveal animation for cards
  cards.forEach((card, i) => {
    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
      },
    );
  });
}

/**
 * Desktop: Scroll-hijack with GSAP ScrollTrigger
 */
function initDesktopScroll(section, container, track, lenis) {
  // Calculate scroll distance
  const getScrollAmount = () => {
    return -(track.scrollWidth - window.innerWidth);
  };

  // Create horizontal scroll animation
  gsap.to(track, {
    x: getScrollAmount,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    },
  });

  // Add stagger reveal for cards
  const cards = track.querySelectorAll(".h-scroll-card");
  cards.forEach((card, i) => {
    gsap.fromTo(
      card,
      {
        opacity: 0.3,
        scale: 0.95,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          containerAnimation: gsap.getById && gsap.getById("hScroll"),
          start: "left 80%",
          end: "left 50%",
          scrub: true,
        },
      },
    );
  });

  // Handle resize with debounce
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  });

  // Add progress counter
  const totalCards = cards.length;
  const counter = document.createElement("div");
  counter.className = "scroll-counter";
  counter.style.cssText = `
    position: fixed;
    bottom: 40px;
    right: 40px;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    color: #8A8A8A;
    z-index: 100;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  counter.innerHTML = `<span class="current">01</span> / <span class="total">${String(totalCards).padStart(2, "0")}</span>`;
  document.body.appendChild(counter);

  // Show/hide counter based on section visibility
  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    onEnter: () => {
      counter.style.opacity = "1";
    },
    onLeave: () => {
      counter.style.opacity = "0";
    },
    onEnterBack: () => {
      counter.style.opacity = "1";
    },
    onLeaveBack: () => {
      counter.style.opacity = "0";
    },
    onUpdate: (self) => {
      const progress = Math.round(self.progress * (totalCards - 1)) + 1;
      counter.querySelector(".current").textContent = String(progress).padStart(
        2,
        "0",
      );
    },
  });
}
