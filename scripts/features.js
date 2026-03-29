console.log('features.js loaded');



// TOC Highlighting
document.addEventListener('DOMContentLoaded', () => {
  const sections = [...document.querySelectorAll('section[id]')];
  const tocLinks = [...document.querySelectorAll('.toc-card a')];

  // Create a map for quick lookup
  const linkMap = new Map(
    tocLinks.map(link => [link.getAttribute('href').slice(1), link])
  );

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;

      // Only activate when the TOP of the section crosses the threshold
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        tocLinks.forEach(a => a.classList.remove('active'));
        const link = linkMap.get(id);
        if (link) link.classList.add('active');
      }
    });
  }, {
    // Activation line: 20% from the top of the viewport
    rootMargin: '-20% 0px -80% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));

  // Clear TOC highlight when above the first section
  window.addEventListener('scroll', () => {
    const first = sections[0];
    const rect = first.getBoundingClientRect();

    if (rect.top > window.innerHeight * 0.20) {
      tocLinks.forEach(a => a.classList.remove('active'));
    }
  });

  // Highlight last section at bottom of page
  window.addEventListener('scroll', () => {
    const scrollBottom = window.innerHeight + window.scrollY;
    const pageBottom = document.documentElement.scrollHeight;

    if (scrollBottom >= pageBottom - 2) {
      tocLinks.forEach(a => a.classList.remove('active'));
      const last = sections[sections.length - 1].id;
      const link = linkMap.get(last);
      if (link) link.classList.add('active');
    }
  });
});



// TOC sticky positioning
function positionTOC() {
  const hero = document.getElementById('case-study-hero');
  const toc = document.querySelector('.toc-card');
  if (!hero || !toc) return;

  const rect = hero.getBoundingClientRect();
  const scrollY = window.scrollY || window.pageYOffset;

  const heroTop = rect.top + scrollY;

  toc.style.marginTop = `${heroTop-6}px`;
}

// Run after everything is fully laid out
window.addEventListener('load', positionTOC);

// Recalculate on resize
window.addEventListener('resize', positionTOC);



// Summary dropdown
function toggleDropdown(source = 'default') {
  const content = document.getElementById("dropdown-content");
  const buttonLabel = document.querySelector("#toggle-dropdown .collapsible-label");
  const buttonIcon = document.querySelector("#toggle-dropdown .icon");
  const isOpen = content.style.maxHeight !== "0px";

  const labels = {
    default: {
      closed: "View Summary",
      open: "Hide Summary"
    },
    home: {
      closed: "About me",
      open: "Hide about me"
    }
  }

  const text = labels[source] || labels.default;

  if (isOpen) {
    // Collapse it
    content.style.maxHeight = "0";
    buttonLabel.textContent = text.closed;
    buttonIcon.classList.remove("fa-chevron-up");
    buttonIcon.classList.add("fa-chevron-down");
  }
  else {
    // Expand it
    content.style.maxHeight = content.scrollHeight + "px";
    buttonLabel.textContent = text.open;
    buttonIcon.classList.add("fa-chevron-up");
    buttonIcon.classList.remove("fa-chevron-down");
  }
}



// Summary dropdown resize on screen change
function updateExpandedHeight() {
  const content = document.getElementById("dropdown-content");
  const currentMax = content.style.maxHeight;

  // Only update if open and not mid-transition
  if (currentMax && currentMax !== "0px") {
    content.style.maxHeight = content.scrollHeight + "px";
  }
}
window.addEventListener("resize", updateExpandedHeight);

let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateExpandedHeight, 100);
});



// Back to top button
document.addEventListener("DOMContentLoaded", () => {
  const backToTop = document.getElementById("back-to-top");

  if (!backToTop) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});



// Mobile TOC and header controls
// Drawer open/close + scroll lock

document.addEventListener("DOMContentLoaded", () => {
  const mobileHeader = document.querySelector('.mobile-toc-header');
  const toggleBtn = document.querySelector('.mobile-toc-toggle');
  const drawer = document.querySelector('.mobile-toc-drawer');
  const overlay = document.querySelector('.mobile-toc-overlay');
  const closeBtn = document.querySelector('.mobile-toc-close');
  const currentLabel = document.querySelector('.mobile-toc-current');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-toc-container a');

  let lastScrollY = 0;
  let bodyOriginalOverflow = '';

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    overlay.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');

    bodyOriginalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = bodyOriginalOverflow || '';
    // allow transition to finish before hiding overlay
    setTimeout(() => {
      if (!overlay.classList.contains('is-open')) {
        overlay.hidden = true;
      }
    }, 200);
  }

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  // Closes drawer on nav change
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // --- Mobile TOC dynamic header text (top-of-viewport activation via scroll) ---

  const sections = Array.from(document.querySelectorAll("section[id]"));
  let currentSectionId = null;

  function updateCurrentSectionFromScroll() {
    // Activation line: top of the viewport
    const activationY = 0;
    let newCurrentId = null;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();

      // Section is "active" if the activation line is within its bounds
      if (rect.top <= activationY && rect.bottom > activationY) {
        newCurrentId = section.id;
        break;
      }
    }

    // If no section contains the activation line, we're above the first section
    currentSectionId = newCurrentId;
    updateMobileHeaderLabel();
  }

  function updateMobileHeaderLabel() {
    if (!currentSectionId) {
      currentLabel.textContent = "";
      return;
    }

    const section = document.getElementById(currentSectionId);
    const h2 = section?.querySelector("h2");
    currentLabel.textContent = h2 ? h2.textContent.trim() : "";
  }

  // Run once on load (in case we land mid-page)
  updateCurrentSectionFromScroll();

  // Update on scroll
  window.addEventListener("scroll", updateCurrentSectionFromScroll, { passive: true });
});