// ============================================================
// BaiYun Lingua — site behaviour (no Firebase dependency)
// Loaded on every page as a plain <script src="/js/main.js" defer>
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("hidden") === false;
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => mobileMenu.classList.add("hidden"))
    );
  }

  /* ---------- Sticky nav shadow on scroll ---------- */
  const nav = document.getElementById("site-nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Highlight current nav link ---------- */
  const here = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const target = link.getAttribute("href");
    if (target === here || (here === "" && target === "index.html")) {
      link.classList.add("active");
    }
  });

  /* ---------- Reveal-on-scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Newsletter form (footer) ---------- */
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = document.getElementById("newsletter-note");
      if (note) {
        note.textContent = "Thanks — you're on the list.";
        note.classList.remove("hidden");
      }
      newsletterForm.reset();
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});
