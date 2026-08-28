/* ##### Décodage b64 ##### */

// Décodage UTF-8
function b64decode(str) {
  // atob() renvoie du latin-1 brut ; Uint8Array + TextDecoder gère correctement l'UTF-8
  const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Décode le <title> de la page
const titleEl = document.querySelector('title[data-b64]');
if (titleEl) titleEl.textContent = b64decode(titleEl.dataset.b64);

// Décode les éléments texte simples
document.querySelectorAll('[data-b64]').forEach(el => {
  el.textContent = b64decode(el.dataset.b64);
});

// Décode les liens mail (href + texte affiché si span vide)
document.querySelectorAll('[data-b64-email]').forEach(el => {
  const email = b64decode(el.dataset.b64Email);
  el.href = 'mailto:' + email;
  // Si l'élément contient un <span> vide dédié à l'affichage, on le remplit
  const display = el.querySelector('[data-b64]');
  if (!display && el.id === 'copy-mail-btn') {
    // Le bouton "Mail" héro garde son libellé "Mail", on stocke juste l'email
    el.dataset.email = email;
  }
});

// Cas particulier : bouton "Me contacter" dans la modal
const modalMailBtn = document.getElementById('modal-mail-btn');
if (modalMailBtn) {
  modalMailBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = modalMailBtn.href;
  });
}

/*  Scroll fade-in  */

const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(el => fadeObs.observe(el));

/*  Active nav link fix  */

const sections  = Array.from(document.querySelectorAll('section[id]'));
const navLinks  = document.querySelectorAll('nav a[href^="#"]');
const headerH   = () => document.querySelector('header').offsetHeight;

function updateNav() {
  const scrollBottom = window.scrollY + window.innerHeight;
  const docHeight    = document.documentElement.scrollHeight;
  let current = '';

  // Si on est tout en bas de la page --> dernière section active
  if (scrollBottom >= docHeight - 4) {
    current = sections[sections.length - 1].id;
  } else {
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - headerH() - 8) current = s.id;
    });
  }

  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/*  Skill bars on scroll  */

const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-bar').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0';
        // rAF force un repaint entre le reset et la valeur cible pour déclencher la transition CSS
        requestAnimationFrame(() => { bar.style.width = w; });
      });
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.skills-list').forEach(el => skillObs.observe(el));

/*  Copie de l'adresse mail dans le clipboard  */

const copyMailBtn = document.getElementById('copy-mail-btn');

if (copyMailBtn) {
  copyMailBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Empêche la page de remonter tout en haut
    const email = copyMailBtn.getAttribute('data-email');
    
    try {
      await navigator.clipboard.writeText(email);
      
      // Feedback visuel temporaire
      const originalText = copyMailBtn.textContent;
      copyMailBtn.textContent = 'Copié !';
      setTimeout(() => { copyMailBtn.textContent = originalText; }, 2000);
    } catch (err) {
      console.error('Échec de la copie :', err);
    }
  });
}

/*  Accordéon timeline expérience  */

document.querySelectorAll('.timeline-toggle').forEach(btn => {
  const details = btn.closest('.timeline-content').querySelector('.timeline-details');
  const icon    = btn.querySelector('.toggle-icon');
  const label   = btn.querySelector('.toggle-label');

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';

    if (open) {
      details.style.maxHeight = '0px';
      btn.setAttribute('aria-expanded', 'false');
      icon.textContent = '[+]';
      label.textContent = 'Détails';
    } else {
      details.style.maxHeight = details.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
      icon.textContent = '[-]';
      label.textContent = 'Réduire';
    }
  });
});

/*  Gestion de la Modal CV  */

const modal = document.getElementById('cv-modal');
const modalBox = modal ? modal.querySelector('.modal-box') : null;
const triggers = document.querySelectorAll('.cv-trigger');
const closers = document.querySelectorAll('.close-trigger');

let lastFocusedEl = null; // Element à refocus après fermeture

function getFocusableEls() {
  return modalBox.querySelectorAll(
    'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
}

function openModal(trigger) {
  lastFocusedEl = trigger || document.activeElement;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Empeche le scroll

  // Focus le premier élément interactif de la modal
  const focusable = getFocusableEls();
  if (focusable.length) focusable[0].focus();
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (lastFocusedEl) lastFocusedEl.focus(); // Rend le focus au déclencheur
}

if (modal) {
  // Ouvrir la modal
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger);
    });
  });

  // Boutons popup
  closers.forEach(closer => {
    closer.addEventListener('click', closeModal);
  });

  // Fermer en cliquant a coté de la box
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Fermer avec Echap + piégeage du focus (Tab) tant que la modal est ouverte
  modal.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusable = Array.from(getFocusableEls());
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}