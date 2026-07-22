(function () {
  "use strict";

  const navDotsContainer = document.getElementById("navDots");
  const navDots = navDotsContainer ? Array.from(navDotsContainer.querySelectorAll(".nav-dot")) : [];

  const sections = Array.from(document.querySelectorAll(".snap-section"));
  const carouselSlides = document.getElementById("carouselSlides");
  const carouselPrev = document.getElementById("carouselPrev");
  const carouselNext = document.getElementById("carouselNext");
  const carouselIndicators = document.getElementById("carouselIndicators");
  const carouselContainer = document.getElementById("carousel");

  const carouselDots = carouselIndicators ? Array.from(carouselIndicators.querySelectorAll(".carousel-dot")) : [];

  const autoplayInterval = 4000;

  let currentSlide = 0;
  let autoplayTimer = null;
  let touchStartX = 0;

  function getSlides() {
    return carouselSlides ? Array.from(carouselSlides.querySelectorAll(".carousel-slide")) : [];
  }

  function goToSlide(index) {
    const slides = getSlides();
    const total = slides.length;

    if (!total) {
      return;
    }

    currentSlide = (index + total) % total;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    carouselDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function previousSlide() {
    goToSlide(currentSlide - 1);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    const slides = getSlides();

    stopAutoplay();

    if (slides.length > 1) {
      autoplayTimer = window.setInterval(nextSlide, autoplayInterval);
    }
  }

  function restartAutoplay() {
    startAutoplay();
  }

  function activateNavigation(index) {
    navDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === index);
    });
  }

  navDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.index);
      const target = document.getElementById(`section-${index}`);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  if (carouselPrev) {
    carouselPrev.addEventListener("click", () => {
      previousSlide();
      restartAutoplay();
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", () => {
      nextSlide();
      restartAutoplay();
    });
  }

  carouselDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.slide));
      restartAutoplay();
    });
  });

  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", stopAutoplay);
    carouselContainer.addEventListener("mouseleave", startAutoplay);
    carouselContainer.addEventListener("focusin", stopAutoplay);
    carouselContainer.addEventListener("focusout", startAutoplay);

    carouselContainer.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0].screenX;
        stopAutoplay();
      },
      { passive: true },
    );

    carouselContainer.addEventListener(
      "touchend",
      (event) => {
        const touchEndX = event.changedTouches[0].screenX;
        const difference = touchEndX - touchStartX;

        if (Math.abs(difference) > 40) {
          if (difference > 0) {
            previousSlide();
          } else {
            nextSlide();
          }
        }

        startAutoplay();
      },
      { passive: true },
    );
  }

  document.addEventListener("keydown", (event) => {
    if (!carouselContainer) {
      return;
    }

    const carouselRect = carouselContainer.getBoundingClientRect();
    const carouselVisible = carouselRect.top < window.innerHeight && carouselRect.bottom > 0;

    if (!carouselVisible) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
      restartAutoplay();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
      restartAutoplay();
    }
  });

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting).sort((first, second) => second.intersectionRatio - first.intersectionRatio);

        if (visibleEntries.length) {
          activateNavigation(Number(visibleEntries[0].target.dataset.index));
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-25% 0px -45% 0px",
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  goToSlide(0);
  activateNavigation(0);
  startAutoplay();
})();
