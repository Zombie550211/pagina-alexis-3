// ============================ NAV ============================
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');

burger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navMenu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', false);
}));
const callFloat = document.querySelector('.call-float');
const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 10);
  callFloat?.classList.toggle('is-visible', window.scrollY > 10);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============================ HERO 3D ============================
const media = document.querySelector('.hero-split__media');
if (media && matchMedia('(hover: hover)').matches) {
  const frame = media.querySelector('.hero-split__frame');
  media.addEventListener('mousemove', e => {
    const r = media.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    frame.style.setProperty('--ry', `${x * 6}deg`);
    frame.style.setProperty('--rx', `${-y * 6}deg`);
    frame.style.setProperty('--px', `${-x * 14}px`);
    frame.style.setProperty('--py', `${-y * 14}px`);
  });
  media.addEventListener('mouseleave', () => {
    ['--ry', '--rx', '--px', '--py'].forEach(v => frame.style.removeProperty(v));
  });
}

// ============================ REVEAL ============================
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ============================ PLANES (CARRUSEL) ============================
const $ = id => document.getElementById(id);
const track = $('planTrack');
const priceCards = [...track.querySelectorAll('.price-card')];
const dotsBox = $('planDots');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let dots = [];

const maxScroll = () => track.scrollWidth - track.clientWidth;
const cardPos = i => Math.min(priceCards[i].offsetLeft - priceCards[0].offsetLeft, maxScroll());
// Posiciones distintas a las que se puede llegar (depende de cuántas tarjetas caben)
const stops = () => [...new Set(priceCards.map((_, i) => Math.round(cardPos(i))))];

function current() {
  const s = stops();
  let best = 0;
  s.forEach((pos, i) => { if (Math.abs(pos - track.scrollLeft) < Math.abs(s[best] - track.scrollLeft)) best = i; });
  return best;
}
function goTo(i) {
  const s = stops();
  track.scrollTo({ left: s[(i + s.length) % s.length] });
}
function buildDots() {
  dotsBox.innerHTML = '';
  dots = stops().map((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel__dot';
    d.setAttribute('aria-label', `Ir al grupo ${i + 1}`);
    d.addEventListener('click', () => { goTo(i); restart(); });
    dotsBox.appendChild(d);
    return d;
  });
  updateDots();
}
function updateDots() {
  const c = current();
  dots.forEach((d, i) => d.classList.toggle('is-active', i === c));
}

let timer = null;
let paused = false;
function start() {
  if (reduceMotion) return;
  stop();
  timer = setInterval(() => { if (!paused) goTo(current() + 1); }, 3500);
}
function stop() { clearInterval(timer); }
function restart() { start(); }

$('planPrev').addEventListener('click', () => { goTo(current() - 1); restart(); });
$('planNext').addEventListener('click', () => { goTo(current() + 1); restart(); });
track.addEventListener('scroll', () => requestAnimationFrame(updateDots), { passive: true });
['mouseenter', 'focusin', 'touchstart'].forEach(ev => track.addEventListener(ev, () => { paused = true; }, { passive: true }));
['mouseleave', 'focusout', 'touchend'].forEach(ev => track.addEventListener(ev, () => { paused = false; }, { passive: true }));
window.addEventListener('resize', buildDots);

// Solo avanza cuando la sección está en pantalla
new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0.3 }).observe(track);
requestAnimationFrame(buildDots);

$('year').textContent = new Date().getFullYear();
