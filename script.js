(function () {
    'use strict';

    // ──────────────────────────────────────
    // CONFIGURATION
    // ──────────────────────────────────────
    const sectionColors = [
        '#5B4CC4', // About Me – deep purple
        '#2EAF7D', // Academic – emerald green
        '#E8624F', // Commerce – warm coral
        '#3B82C4', // GitHub Projects – ocean blue
        '#C94057', // Contact Info – crimson rose

        '#FFFFFF', // white
    ];

    const sectionRGB = [
        [91, 76, 196],
        [46, 175, 125],
        [232, 98, 79],
        [59, 130, 196],
        [201, 64, 87],
    ];

    const carouselImages = [
        'images/about1.jpg',
        'images/about2.jpg',
        'images/about3.jpg',
    ];

    const autoplayInterval = 4000; // ms

    // ──────────────────────────────────────
    // DOM REFERENCES
    // ──────────────────────────────────────
    const gradientOverlay = document.getElementById('gradientOverlay');
    const navDotsContainer = document.getElementById('navDots');
    const navDots = navDotsContainer.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.snap-section');
    const carouselSlides = document.getElementById('carouselSlides');
    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const carouselDotEls = carouselIndicators.querySelectorAll('.carousel-dot');

    let currentSlide = 0;
    let autoplayTimer = null;
    let isCarouselPaused = false;

    // ──────────────────────────────────────
    // HELPER: HEX TO RGBA
    // ──────────────────────────────────────
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ──────────────────────────────────────
    // APPLY SECTION BACKGROUNDS
    // ──────────────────────────────────────
    function applySectionBackgrounds() {
        sections.forEach((section, i) => {
            const rgba = hexToRgba(sectionColors[i], 0.88);
            section.style.backgroundColor = rgba;
        });
    }

    // ──────────────────────────────────────
    // SET NAV DOT COLORS
    // ──────────────────────────────────────
    function setNavDotColors() {
        navDots.forEach((dot, i) => {
            dot.style.borderColor = sectionColors[i];
            // On active, we use a bright version; handled in CSS via .active class
        });
    }

    // ──────────────────────────────────────
    // CAROUSEL LOGIC
    // ──────────────────────────────────────
    function goToSlide(index) {
        const slides = carouselSlides.querySelectorAll('.carousel-slide');
        const totalSlides = slides.length;
        if (totalSlides === 0) return;

        // Wrap around
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        // Remove active from all
        slides.forEach(s => s.classList.remove('active'));
        carouselDotEls.forEach(d => d.classList.remove('active'));

        // Set new active
        slides[index].classList.add('active');
        if (carouselDotEls[index]) carouselDotEls[index].classList.add('active');

        currentSlide = index;
    }

    function nextSlide() {
        const totalSlides = carouselSlides.querySelectorAll('.carousel-slide').length;
        goToSlide((currentSlide + 1) % totalSlides);
    }

    function prevSlide() {
        const totalSlides = carouselSlides.querySelectorAll('.carousel-slide').length;
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

    // Carousel button listeners
    if (carouselPrev) {
        carouselPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
            // Restart autoplay timer on manual interaction
            stopAutoplay();
            startAutoplay();
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
            stopAutoplay();
            startAutoplay();
        });
    }

    // Carousel indicator dots
    carouselDotEls.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
            goToSlide(slideIndex);
            stopAutoplay();
            startAutoplay();
        });
    });

    // Pause autoplay on hover
    const carouselContainer = document.getElementById('carousel');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', pauseAutoplay);
        carouselContainer.addEventListener('mouseleave', resumeAutoplay);
        carouselContainer.addEventListener('touchstart', pauseAutoplay, { passive: true });
        carouselContainer.addEventListener('touchend', () => {
            // Small delay before resuming
            setTimeout(resumeAutoplay, 1500);
        });
    }

    // Keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        // Only when About Me section is roughly in view
        const aboutSection = document.getElementById('section-0');
        if (!aboutSection) return;
        const rect = aboutSection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
            stopAutoplay();
            startAutoplay();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
            stopAutoplay();
            startAutoplay();
        }
    });

    // ──────────────────────────────────────
    // NAVIGATION DOTS – CLICK HANDLERS
    // ──────────────────────────────────────
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'), 10);
            const targetSection = document.getElementById('section-' + index);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ──────────────────────────────────────
    // ACTIVE DOT TRACKING VIA INTERSECTION OBSERVER
    // ──────────────────────────────────────
    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    };

    const sectionVisibilityMap = new Map(); // section index -> max ratio

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const index = parseInt(entry.target.getAttribute('data-index'), 10);
            sectionVisibilityMap.set(index, entry.intersectionRatio);
        });

        // Find the section with the highest intersection ratio
        let maxRatio = 0;
        let mostVisibleIndex = 0;
        sectionVisibilityMap.forEach((ratio, idx) => {
            if (ratio > maxRatio) {
                maxRatio = ratio;
                mostVisibleIndex = idx;
            }
        });

        // Update active dot
        navDots.forEach((dot, i) => {
            if (i === mostVisibleIndex && maxRatio > 0.3) {
                dot.classList.add('active');
                dot.style.backgroundColor = sectionColors[i];
                dot.style.borderColor = '#fff';
                dot.style.boxShadow = '0 0 16px ' + hexToRgba(sectionColors[i], 0.7);
            } else {
                dot.classList.remove('active');
                dot.style.backgroundColor = 'transparent';
                dot.style.borderColor = sectionColors[i];
                dot.style.boxShadow = 'none';
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ──────────────────────────────────────
    // TEXT FADE VIA INTERSECTION OBSERVER
    // ──────────────────────────────────────
    const fadeObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1],
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const contentEl = entry.target.querySelector('.fade-content');
            if (!contentEl) return;
            const ratio = entry.intersectionRatio;
            // Smooth mapping: use ratio directly with a slight ease
            const opacity = Math.min(1, Math.max(0, ratio * 1.1));
            contentEl.style.opacity = opacity;
        });
    }, fadeObserverOptions);

    sections.forEach(section => {
        fadeObserver.observe(section);
    });

    // ──────────────────────────────────────
    // DYNAMIC GRADIENT BASED ON SCROLL
    // ──────────────────────────────────────
    function lerpColor(rgb1, rgb2, t) {
        return [
            Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t),
            Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t),
            Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t),
        ];
    }

    function getColorAtProgress(progress) {
        // progress: 0 to 1 across all sections
        const numSections = sectionColors.length;
        const scaledProgress = Math.max(0, Math.min(1, progress));
        const floatIndex = scaledProgress * (numSections - 1);
        const lowerIndex = Math.floor(floatIndex);
        const upperIndex = Math.min(lowerIndex + 1, numSections - 1);
        const frac = floatIndex - lowerIndex;

        if (lowerIndex === upperIndex) {
            return sectionRGB[lowerIndex];
        }
        return lerpColor(sectionRGB[lowerIndex], sectionRGB[upperIndex], frac);
    }

    function rgbToString(rgb) {
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }

    function updateGradient() {
        const scrollY = window.scrollY;
        const totalScrollable = (sections.length - 1) * window.innerHeight;
        const progress = totalScrollable > 0 ? Math.max(0, Math.min(1, scrollY / totalScrollable)) : 0;

        // Get colors at various offsets for a rich gradient
        const offset = 0.18;
        const progressBefore = Math.max(0, progress - offset);
        const progressAfter = Math.min(1, progress + offset);
        const progressFarAfter = Math.min(1, progress + offset * 2);

        const colorStart = rgbToString(getColorAtProgress(progressBefore));
        const colorMid = rgbToString(getColorAtProgress(progress));
        const colorEnd = rgbToString(getColorAtProgress(progressAfter));
        const colorFarEnd = rgbToString(getColorAtProgress(progressFarAfter));

        const gradientString = `linear-gradient(145deg, ${colorStart} 0%, ${colorMid} 35%, ${colorEnd} 70%, ${colorFarEnd} 100%)`;
        gradientOverlay.style.background = gradientString;
    }

    // Throttled scroll handler using requestAnimationFrame
    let rafId = null;
    function onScroll() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            updateGradient();
            rafId = null;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Also update on resize (viewport height changes)
    window.addEventListener('resize', () => {
        updateGradient();
    });

    // ──────────────────────────────────────
    // INITIALIZATION
    // ──────────────────────────────────────
    function init() {
        applySectionBackgrounds();
        setNavDotColors();
        updateGradient();

        // Set initial active dot
        navDots[0].classList.add('active');
        navDots[0].style.backgroundColor = sectionColors[0];
        navDots[0].style.borderColor = '#fff';
        navDots[0].style.boxShadow = '0 0 16px ' + hexToRgba(sectionColors[0], 0.7);

        // Start carousel autoplay
        startAutoplay();

        // Ensure all fade-content starts at opacity 1 for the visible section
        document.querySelectorAll('.fade-content').forEach(el => {
            el.style.opacity = '1';
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();