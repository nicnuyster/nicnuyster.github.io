(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sections = [...document.querySelectorAll(".snap-section")];
  const navButtons = [...document.querySelectorAll(".nav-dot")];

  const setActiveNavigation = (index) => {
    navButtons.forEach((button) => {
      const isActive = Number(button.dataset.index) === index;

      button.classList.toggle("active", isActive);

      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  };

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const targetSection = sections[index];

      if (!targetSection) {
        return;
      }

      targetSection.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      setActiveNavigation(index);
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleSections.length > 0) {
          setActiveNavigation(Number(visibleSections[0].target.dataset.index));
        }
      },
      {
        root: null,
        rootMargin: "-30% 0px -45% 0px",
        threshold: [0.05, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));
  }

  const carousel = document.querySelector("#carousel");
  const slides = [...document.querySelectorAll(".carousel-slide")];
  const dots = [...document.querySelectorAll(".carousel-dot")];
  const previousButton = document.querySelector("#carouselPrev");
  const nextButton = document.querySelector("#carouselNext");

  if (!carousel || slides.length === 0 || !previousButton || !nextButton) {
    return;
  }

  let activeSlide = 0;
  let autoplayId = null;

  const renderSlide = (nextIndex) => {
    activeSlide = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeSlide;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeSlide;
      dot.classList.toggle("active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const stopAutoplay = () => {
    if (autoplayId !== null) {
      window.clearInterval(autoplayId);
      autoplayId = null;
    }
  };

  const startAutoplay = () => {
    if (reduceMotion || slides.length < 2) {
      return;
    }

    stopAutoplay();

    autoplayId = window.setInterval(() => {
      renderSlide(activeSlide + 1);
    }, 6500);
  };

  previousButton.addEventListener("click", () => {
    renderSlide(activeSlide - 1);
    startAutoplay();
  });

  nextButton.addEventListener("click", () => {
    renderSlide(activeSlide + 1);
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      renderSlide(Number(dot.dataset.slide));
      startAutoplay();
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutoplay();
    }
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      renderSlide(activeSlide - 1);
      startAutoplay();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      renderSlide(activeSlide + 1);
      startAutoplay();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  renderSlide(0);
  startAutoplay();
})();
