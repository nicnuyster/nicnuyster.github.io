// script.js

/* ---------- COLOUR MAP FOR SECTIONS ---------- */
const sectionColors = {
  about: '#D6EAF8',      // soft blue
  academic: '#D5F5E3',   // soft green
  commerce: '#FDEBD0',   // soft orange/peach
  github: '#E8DAEF',     // soft lavender
  contact: '#FADBD8'     // soft rose
};

/* ---------- DOM ELEMENTS ---------- */
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('#sidebar a');
const headerSpan = document.getElementById('active-section-name');
const body = document.body;

/**
 * Activates a given section by id.
 * - Removes 'active' class from all sections.
 * - Adds 'active' to the target section.
 * - Updates the body background colour (CSS transition handles the animation).
 * - Updates the fixed header text and sidebar active state.
 */
function setActiveSection(sectionId) {
  // Deactivate all sections
  sections.forEach(sec => sec.classList.remove('active'));

  // Activate the target section
  const target = document.getElementById(sectionId);
  if (!target) return;

  target.classList.add('active');

  // Change body background colour (transitioned via CSS)
  body.style.backgroundColor = sectionColors[sectionId] || '#ffffff';

  // Update header text (using data-title for consistency)
  headerSpan.textContent = target.dataset.title || sectionId;

  // Highlight the corresponding nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
}

/* ---------- NAVIGATION CLICK HANDLER ---------- */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute('href').substring(1); // remove '#'
    setActiveSection(sectionId);
  });
});

/* ---------- INITIALISE ON PAGE LOAD ---------- */
// Start with the first section (About Me) visible
setActiveSection('about');

/* ---------- SIMPLE IMAGE CAROUSEL (About Me) ---------- */
const carousel = document.querySelector('#about .carousel');
if (carousel) {
  const images = carousel.querySelectorAll('.carousel-image');
  let currentIndex = 0;

  function showImage(index) {
    images.forEach((img, i) => {
      img.style.opacity = i === index ? '1' : '0';
    });
  }

  // initial display
  showImage(currentIndex);

  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(currentIndex);
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    showImage(currentIndex);
  });

  // optional: keyboard accessibility
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      nextBtn.click();
    }
  });
}

/* ---------- PREVENT ACCIDENTAL PAGE SCROLL (wheel/touch) ---------- */
// Since overflow:hidden is set on html/body, this ensures no default scroll behaviour
window.addEventListener('wheel', (e) => {
  // Allow scrolling inside the active section if it has overflow
  const activeSection = document.querySelector('.section.active');
  if (activeSection && activeSection.contains(e.target)) {
    // The section itself handles the scroll; do nothing
    return;
  }
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  const activeSection = document.querySelector('.section.active');
  if (activeSection && activeSection.contains(e.target)) {
    return;
  }
  e.preventDefault();
}, { passive: false });