// Function to manage section visibility and seamless transitions
const SectionManager = (() => {
    // Collect all relevant elements
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.sidebar a');
    const headerTitle = document.getElementById('active-section-title');
    const body = document.body;

    // Track state
    let isTransitioning = false;

    // Map section IDs to UI elements (background color and header title)
    const sectionData = {
        'about-me': { color: 'var(--color-about)', title: 'About Me' },
        'academic-experience': { color: 'var(--color-academic)', title: 'Academic Experience' },
        'commerce-experience': { color: 'var(--color-commerce)', title: 'Commerce Experience' },
        'github-projects': { color: 'var(--color-github)', title: 'GitHub Projects' },
        'contact-info': { color: 'var(--color-contact)', title: 'Contact Info' }
    };

    // Internal function to change the active section
    const switchSection = (targetSectionId) => {
        // Prevent multiple simultaneous transitions
        if (isTransitioning) return;
        isTransitioning = true;

        const currentSection = document.querySelector('.section.active');
        const targetSection = document.getElementById(targetSectionId);

        // Do nothing if already on the active section
        if (!targetSection || currentSection === targetSection) {
            isTransitioning = false;
            return;
        }

        // 1. Leave the current section:
        // CSS transitions handle fading out and translating translateY.
        currentSection.classList.remove('active');

        // 2. Transition the global state (body color and header title):
        // CSS transitions the body's background-color smoothly.
        const data = sectionData[targetSectionId];
        if (data) {
            body.style.backgroundColor = data.color;
            headerTitle.textContent = data.title;
        }

        // 3. Update the navigation links in the sidebar
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${targetSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // 4. Enter the new section:
        // CSS handles fading in and sliding into place (opacity 0 -> 1, translateY 20 -> 0).
        targetSection.classList.add('active');

        // Allow another transition after the current one finishes (CSS time)
        setTimeout(() => {
            isTransitioning = false;
        }, 600); // Must match --transition-speed in style.css
    };

    // Initialize the manager
    const init = () => {
        // Smooth scroll handling for internal links (nav and hash links)
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                
                // If switching sections, block default jump and use transition logic
                if (targetId && sectionData[targetId]) {
                    e.preventDefault();
                    switchSection(targetId);
                    
                    // Optional: Update the browser URL hash without causing a jump
                    history.pushState(null, null, `#${targetId}`);
                }
            });
        });

        // Optional: Check hash on page load to initialize the correct section
        const currentHash = window.location.hash.substring(1);
        if (currentHash && sectionData[currentHash]) {
            // Wait briefly for initial load/render
            setTimeout(() => {
                switchSection(currentHash);
            }, 100);
        }
    };

    // Return the public init method
    return { init };
})();

// A separate simple manager for the carousel component
const CarouselManager = (() => {
    // Internal state tracking
    let currentSlide = 0;
    let track = null;
    let slides = [];
    let prevBtn = null;
    let nextBtn = null;

    const updateCarousel = () => {
        if (!track || slides.length === 0) return;
        const width = slides[0].getBoundingClientRect().width;
        // Slide the track using CSS transform
        track.style.transform = `translateX(-${currentSlide * width}px)`;
    };

    const init = () => {
        // Initialize carousel elements within the DOM
        const container = document.querySelector('.carousel-container');
        if (!container) return; // Carousel might not be present

        track = container.querySelector('.carousel-track');
        slides = Array.from(track.children);
        prevBtn = container.querySelector('.carousel-btn.prev');
        nextBtn = container.querySelector('.carousel-btn.next');

        if (slides.length < 2) return; // No need for buttons if 1 or 0 photos

        // Set initial positions of buttons based on slide count
        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
            updateCarousel();
        });

        // Optional: Handle window resize if images can change size
        window.addEventListener('resize', updateCarousel);
    };

    return { init };
})();

// Start everything once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    SectionManager.init();
    CarouselManager.init();
});