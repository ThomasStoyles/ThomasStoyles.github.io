/* main.js — navigation, scroll animations, typing effect */

// ---- Navbar scroll behaviour ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close mobile menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// ---- Active nav link on scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ---- Scroll reveal ----
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger sibling cards
      const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      let delay = 0;
      siblings.forEach(sib => {
        if (sib === entry.target) {
          sib.style.transitionDelay = `${delay}ms`;
          sib.classList.add('visible');
          delay += 80;
        }
      });
      if (!entry.target.classList.contains('visible')) {
        entry.target.classList.add('visible');
      }
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Typing animation ----
const phrases = [
  'building LLM pipelines',
  'deploying RAG systems',
  'architecting agents',
  'shipping to production',
  'working with Claude',
];

const target  = document.getElementById('rotating-title');
let phraseIdx = 0;
let charIdx   = 0;
let deleting  = false;
let paused    = false;

function tick() {
  if (paused) return;

  const current = phrases[phraseIdx];

  if (!deleting) {
    charIdx++;
    target.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) {
      paused = true;
      setTimeout(() => { paused = false; deleting = true; loop(); }, 2200);
      return;
    }
  } else {
    charIdx--;
    target.textContent = current.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  loop();
}

function loop() {
  const delay = deleting ? 40 : charIdx === 0 ? 400 : 65;
  setTimeout(tick, delay);
}

loop();

// ---- Smooth anchor scroll (offset for fixed nav) ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
