(function () {
  "use strict";

  // ──────────────────────────────────────
  // КОНФИГУРАЦИЯ
  // ──────────────────────────────────────
  const autoplayInterval = 5000; // ms — обновлено до 5 секунд

  // ──────────────────────────────────────
  // DOM-ССЫЛКИ
  // ──────────────────────────────────────
  const navDotsContainer = document.getElementById("navDots");
  const navDots = navDotsContainer ? navDotsContainer.querySelectorAll(".nav-dot") : [];
  const sections = document.querySelectorAll(".section");
  const carouselSlides = document.getElementById("carouselSlides");
  const carouselPrev = document.getElementById("carouselPrev");
  const carouselNext = document.getElementById("carouselNext");
  const carouselIndicators = document.getElementById("carouselIndicators");
  const carouselDotEls = carouselIndicators ? carouselIndicators.querySelectorAll(".carousel-dot") : [];
  const bgCanvas = document.getElementById("bgCanvas");
  const progressBar = document.getElementById("scrollProgress");

  let currentSlide = 0;
  let autoplayTimer = null;
  let isCarouselPaused = false;

  // ──────────────────────────────────────
  // CSS-ПЕРЕМЕННЫЕ (динамическое чтение)
  // ──────────────────────────────────────
  const rootStyles = getComputedStyle(document.documentElement);
  const accentPrimary = rootStyles.getPropertyValue("--accent-primary").trim() || "#3b82f6";
  const accentSecondary = rootStyles.getPropertyValue("--accent-secondary").trim() || "#8b5cf6";
  const accentPrimaryRgb = rootStyles.getPropertyValue("--accent-primary-rgb").trim() || "59, 130, 246";

  // ──────────────────────────────────────
  // КАРУСЕЛЬ
  // ──────────────────────────────────────
  function goToSlide(index) {
    const slides = carouselSlides ? carouselSlides.querySelectorAll(".carousel-slide") : [];
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    slides.forEach((s) => s.classList.remove("active"));
    carouselDotEls.forEach((d) => {
      d.classList.remove("active");
      d.setAttribute("aria-selected", "false");
    });

    slides[index].classList.add("active");
    if (carouselDotEls[index]) {
      carouselDotEls[index].classList.add("active");
      carouselDotEls[index].setAttribute("aria-selected", "true");
    }

    currentSlide = index;
  }

  function nextSlide() {
    const slides = carouselSlides ? carouselSlides.querySelectorAll(".carousel-slide") : [];
    const totalSlides = slides.length;
    if (totalSlides === 0) return;
    goToSlide((currentSlide + 1) % totalSlides);
  }

  function prevSlide() {
    const slides = carouselSlides ? carouselSlides.querySelectorAll(".carousel-slide") : [];
    const totalSlides = slides.length;
    if (totalSlides === 0) return;
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
  }

  function startAutoplay() {
    stopAutoplay();
    if (!isCarouselPaused) {
      autoplayTimer = setInterval(nextSlide, autoplayInterval);
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function pauseAutoplay() {
    isCarouselPaused = true;
    stopAutoplay();
  }

  function resumeAutoplay() {
    isCarouselPaused = false;
    startAutoplay();
  }

  // Кнопки карусели
  if (carouselPrev) {
    carouselPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", (e) => {
      e.stopPropagation();
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  // Индикаторы карусели
  carouselDotEls.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const slideIndex = parseInt(dot.getAttribute("data-slide"), 10);
      goToSlide(slideIndex);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Пауза при наведении / таче
  const carouselContainer = document.getElementById("carousel");
  if (carouselContainer) {
    carouselContainer.addEventListener("mouseenter", pauseAutoplay);
    carouselContainer.addEventListener("mouseleave", resumeAutoplay);
    carouselContainer.addEventListener("touchstart", pauseAutoplay, { passive: true });
    carouselContainer.addEventListener("touchend", () => {
      setTimeout(resumeAutoplay, 1500);
    });
  }

  // Клавиатурная навигация карусели
  document.addEventListener("keydown", (e) => {
    const aboutSection = document.getElementById("section-0");
    if (!aboutSection) return;
    const rect = aboutSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!isVisible) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
      stopAutoplay();
      startAutoplay();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
      stopAutoplay();
      startAutoplay();
    }
  });

  // Обработка ошибок загрузки изображений — показываем placeholder
  if (carouselSlides) {
    const images = carouselSlides.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("error", function () {
        this.style.display = "none";
        const placeholder = this.parentElement.querySelector(".carousel-placeholder");
        if (placeholder) {
          placeholder.style.display = "flex";
        }
      });
      // Если src пустой или не задан — показываем placeholder
      if (!img.src || img.src === window.location.href || img.getAttribute("src") === "") {
        img.style.display = "none";
        const placeholder = img.parentElement.querySelector(".carousel-placeholder");
        if (placeholder) {
          placeholder.style.display = "flex";
        }
      }
    });
  }

  // ──────────────────────────────────────
  // НАВИГАЦИЯ — КЛИК ПО ТОЧКАМ
  // ──────────────────────────────────────
  navDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"), 10);
      const targetSection = document.getElementById("section-" + index);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ──────────────────────────────────────
  // АКТИВНАЯ ТОЧКА — INTERSECTION OBSERVER
  // ──────────────────────────────────────
  const sectionObserverOptions = {
    root: null,
    rootMargin: "0px",
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
  };

  const sectionVisibilityMap = new Map();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const index = parseInt(entry.target.getAttribute("data-index"), 10);
      sectionVisibilityMap.set(index, entry.intersectionRatio);
    });

    let maxRatio = 0;
    let mostVisibleIndex = 0;
    sectionVisibilityMap.forEach((ratio, idx) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        mostVisibleIndex = idx;
      }
    });

    navDots.forEach((dot, i) => {
      if (i === mostVisibleIndex && maxRatio > 0.3) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }, sectionObserverOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // ──────────────────────────────────────
  // АНИМАЦИИ ПРИ СКРОЛЛЕ — INTERSECTION OBSERVER
  // ──────────────────────────────────────
  const animateObserverOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.1,
  };

  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        animateObserver.unobserve(entry.target);
      }
    });
  }, animateObserverOptions);

  document.querySelectorAll(".animate-fade-in-up, .animate-fade-in, .animate-scale-in").forEach((el) => {
    animateObserver.observe(el);
  });

  // ──────────────────────────────────────
  // СЕКЦИЯ 0: АНИМАЦИЯ ПРИ ВХОДЕ В VIEWPORT (ratio > 0.3)
  // ──────────────────────────────────────
  const aboutSection = document.getElementById("section-0");
  if (aboutSection) {
    const aboutObserverOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3,
    };

    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const animatedElements = entry.target.querySelectorAll(".animate-fade-in-up, .animate-fade-in, .animate-scale-in");
          animatedElements.forEach((el) => {
            el.classList.add("visible");
          });
          aboutObserver.unobserve(entry.target);
        }
      });
    }, aboutObserverOptions);

    aboutObserver.observe(aboutSection);
  }

  // ──────────────────────────────────────
  // ИНДИКАТОР ПРОГРЕССА СКРОЛЛА
  // ──────────────────────────────────────
  function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  // ──────────────────────────────────────
  // CANVAS: ANIMATED PARTICLE NETWORK
  // ──────────────────────────────────────
  let canvasCtx = null;
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let animFrameId = null;

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = c1.r + (c2.r - c1.r) * factor;
    const g = c1.g + (c2.g - c1.g) * factor;
    const b = c1.b + (c2.b - c1.b) * factor;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  function initCanvas() {
    if (!bgCanvas) return;
    canvasCtx = bgCanvas.getContext("2d");
    if (!canvasCtx) return;

    resizeCanvas();
    createParticles();
    animateParticles();

    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    document.addEventListener("mouseleave", () => {
      mouseX = -1000;
      mouseY = -1000;
    });
  }

  function resizeCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(80, Math.max(50, Math.floor((bgCanvas.width * bgCanvas.height) / 15000)));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * bgCanvas.width,
        y: Math.random() * bgCanvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.3,
      });
    }
  }

  function animateParticles() {
    if (!canvasCtx || !bgCanvas) return;

    canvasCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollHeight > 0 ? Math.max(0, Math.min(1, scrollTop / scrollHeight)) : 0;

    const currentAccentColor = interpolateColor(accentPrimary, accentSecondary, scrollProgress);

    // Обновление позиций частиц
    particles.forEach((p) => {
      // Отталкивание от курсора
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && dist > 0) {
        const force = (100 - dist) / 100;
        p.vx += (dx / dist) * force * 0.5;
        p.vy += (dy / dist) * force * 0.5;
      }

      // Ограничение скорости
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const maxSpeed = 0.7;
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Отскок от границ
      if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

      // Ограничение позиции
      p.x = Math.max(0, Math.min(bgCanvas.width, p.x));
      p.y = Math.max(0, Math.min(bgCanvas.height, p.y));
    });

    // Рисование линий между частицами
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const lineOpacity = (1 - dist / 150) * 0.08;
          canvasCtx.beginPath();
          canvasCtx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
          canvasCtx.lineWidth = 0.5;
          canvasCtx.moveTo(particles[i].x, particles[i].y);
          canvasCtx.lineTo(particles[j].x, particles[j].y);
          canvasCtx.stroke();
        }
      }
    }

    // Рисование точек
    particles.forEach((p) => {
      canvasCtx.beginPath();
      canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      canvasCtx.fillStyle = currentAccentColor;
      canvasCtx.globalAlpha = p.opacity;
      canvasCtx.fill();
      canvasCtx.globalAlpha = 1;
    });

    animFrameId = requestAnimationFrame(animateParticles);
  }

  // ──────────────────────────────────────
  // МОБИЛЬНЫЙ ИНДИКАТОР ПРОГРЕССА (внизу экрана)
  // ──────────────────────────────────────
  const mobileProgress = document.getElementById("mobileProgress");

  function updateMobileProgress() {
    if (!mobileProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    mobileProgress.style.width = progress + "%";
  }

  window.addEventListener("scroll", updateMobileProgress, { passive: true });

  // ──────────────────────────────────────
  // TIMELINE ANIMATIONS — STAGGERED REVEAL
  // ──────────────────────────────────────
  const timelineObserverOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.2,
  };

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const timelineItems = entry.target.querySelectorAll(".timeline-item");
        timelineItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("visible");
            // Also trigger inner animations
            item.querySelectorAll(".animate-fade-in-up").forEach((el) => {
              el.classList.add("is-visible");
              el.classList.add("visible");
            });
          }, index * 150);
        });
        timelineObserver.unobserve(entry.target);
      }
    });
  }, timelineObserverOptions);

  document.querySelectorAll(".timeline").forEach((timeline) => {
    timelineObserver.observe(timeline);
  });

  // ──────────────────────────────────────
  // ИНИЦИАЛИЗАЦИЯ
  // ──────────────────────────────────────
  function init() {
    if (navDots[0]) {
      navDots[0].classList.add("active");
    }

    startAutoplay();
    updateScrollProgress();
    updateMobileProgress();
    initCanvas();

    // Первая секция видна сразу — показываем без анимации
    const firstSection = document.getElementById("section-0");
    if (firstSection) {
      firstSection.querySelectorAll(".animate-fade-in-up, .animate-fade-in, .animate-scale-in").forEach((el) => {
        el.style.opacity = "1";
        el.classList.add("is-visible");
        el.classList.add("visible");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
