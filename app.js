const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const subtitle = document.getElementById('typed-subtitle');
const originalSubtitle = subtitle?.textContent?.trim() || '';

function typeText(el, text, speed = 28) {
  if (!el || reduceMotion) return;
  el.textContent = '';
  let index = 0;
  const timer = setInterval(() => {
    el.textContent += text[index] || '';
    index += 1;
    if (index >= text.length) clearInterval(timer);
  }, speed);
}

typeText(subtitle, originalSubtitle);

const revealItems = [...document.querySelectorAll('.reveal')];
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);
revealItems.forEach((item) => observer.observe(item));

const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = Number(entry.target.dataset.target || 0);
      let value = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const timer = setInterval(() => {
        value += step;
        if (value >= target) {
          value = target;
          clearInterval(timer);
        }
        entry.target.textContent = `${value}+`;
      }, 35);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.7 }
);
counters.forEach((counter) => counterObserver.observe(counter));

const progress = document.querySelector('.scroll-progress');
const navLinks = [...document.querySelectorAll('.floating-nav a')];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateProgressAndNav() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = window.scrollY;
  const percent = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;

  let activeSection = sections[0];
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.28) {
      activeSection = section;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeSection.id}`;
    link.classList.toggle('active', isActive);
  });
}

window.addEventListener('scroll', updateProgressAndNav, { passive: true });
window.addEventListener('load', updateProgressAndNav);

const cards = document.querySelectorAll('.parallax-card');
if (!reduceMotion) {
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * 5;
      const rotateX = -((y - midY) / midY) * 5;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

const glow = document.querySelector('.cursor-glow');
if (glow && !reduceMotion) {
  window.addEventListener('pointermove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

const canvas = document.getElementById('particle-canvas');
const ctx = canvas?.getContext('2d');

if (canvas && ctx && !reduceMotion) {
  let particles = [];
  const isMobile = () => window.innerWidth < 800;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = isMobile() ? 36 : 74;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.42,
      vy: (Math.random() - 0.5) * 0.42,
      r: Math.random() * 2 + 0.8,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(138, 219, 255, 0.9)';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j += 1) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(88, 213, 255, ${1 - dist / 120})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  drawParticles();
  window.addEventListener('resize', resizeCanvas);
}
