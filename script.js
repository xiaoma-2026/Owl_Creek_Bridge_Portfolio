const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".topbar__links");
const navAnchors = navLinks?.querySelectorAll("a") ?? [];
const sectionNodes = document.querySelectorAll("main > .section");
const progressBar = document.querySelector("#scroll-progress-bar");
const backToTop = document.querySelector("#back-to-top");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navAnchors.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const updateScrollUi = () => {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  if (backToTop) {
    backToTop.classList.toggle("is-visible", scrollTop > 480);
  }
};

updateScrollUi();
window.addEventListener("scroll", updateScrollUi, { passive: true });
window.addEventListener("resize", updateScrollUi);

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  sectionNodes.forEach((section) => {
    revealObserver.observe(section);
  });
} else {
  sectionNodes.forEach((section) => {
    section.classList.add("is-visible");
  });
}

if ("IntersectionObserver" in window && navAnchors.length > 0) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries.length === 0) {
        return;
      }

      const activeId = visibleEntries[0].target.id;
      navAnchors.forEach((anchor) => {
        anchor.classList.toggle("is-active", anchor.getAttribute("href") === `#${activeId}`);
      });
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: "-18% 0px -55% 0px",
    }
  );

  navAnchors.forEach((anchor) => {
    const selector = anchor.getAttribute("href");
    const section = selector ? document.querySelector(selector) : null;
    if (section) {
      activeObserver.observe(section);
    }
  });
}

const setPointerGlow = (event, element) => {
  const rect = element.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  element.style.setProperty("--mx", `${x}%`);
  element.style.setProperty("--my", `${y}%`);
};

const figureCards = document.querySelectorAll(".figure__image-wrap");

if (!prefersReducedMotion) {
  figureCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      setPointerGlow(event, card);
      const rect = card.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
      card.style.transform = `translateY(-4px) scale(1.01) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

document.querySelectorAll(".sequence__card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    setPointerGlow(event, card);
  });
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxIndex = document.querySelector("#lightbox-index");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxTriggers = document.querySelectorAll("[data-lightbox]");
const lightboxClosers = document.querySelectorAll("[data-close-lightbox]");
const lightboxPrev = document.querySelector("[data-lightbox-prev]");
const lightboxNext = document.querySelector("[data-lightbox-next]");
let currentLightboxIndex = -1;

const openLightboxAt = (index) => {
  if (
    !lightbox ||
    !lightboxImage ||
    !lightboxTitle ||
    !lightboxIndex ||
    !lightboxCaption ||
    index < 0 ||
    index >= lightboxTriggers.length
  ) {
    return;
  }

  const trigger = lightboxTriggers[index];
  const image = trigger.getAttribute("data-image");
  const title = trigger.getAttribute("data-title");
  const caption = trigger.getAttribute("data-caption");
  const alt = trigger.querySelector("img")?.getAttribute("alt") ?? "";

  if (!image || !title || !caption) {
    return;
  }

  currentLightboxIndex = index;
  lightboxImage.setAttribute("src", image);
  lightboxImage.setAttribute("alt", alt);
  lightboxTitle.textContent = title;
  lightboxIndex.textContent = `Image ${index + 1} of ${lightboxTriggers.length}`;
  lightboxCaption.textContent = caption;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxIndex || !lightboxCaption) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lightboxImage.setAttribute("src", "");
  lightboxImage.setAttribute("alt", "");
  lightboxTitle.textContent = "";
  lightboxIndex.textContent = "";
  lightboxCaption.textContent = "";
  currentLightboxIndex = -1;
};

if (lightbox && lightboxImage && lightboxTitle && lightboxIndex && lightboxCaption) {
  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      openLightboxAt(index);
    });
  });

  lightboxClosers.forEach((closer) => {
    closer.addEventListener("click", closeLightbox);
  });

  lightboxPrev?.addEventListener("click", () => {
    if (currentLightboxIndex === -1) {
      return;
    }

    const nextIndex =
      (currentLightboxIndex - 1 + lightboxTriggers.length) % lightboxTriggers.length;
    openLightboxAt(nextIndex);
  });

  lightboxNext?.addEventListener("click", () => {
    if (currentLightboxIndex === -1) {
      return;
    }

    const nextIndex = (currentLightboxIndex + 1) % lightboxTriggers.length;
    openLightboxAt(nextIndex);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }

    if (event.key === "ArrowLeft" && lightbox.classList.contains("is-open")) {
      lightboxPrev?.click();
    }

    if (event.key === "ArrowRight" && lightbox.classList.contains("is-open")) {
      lightboxNext?.click();
    }
  });
}
