/* ============================================================
   ESSENZIA MOVELARIA — Interactions
   ============================================================ */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '5519989870136';

  // --------------------------------------------------------
  // Year
  // --------------------------------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --------------------------------------------------------
  // Header scroll state
  // --------------------------------------------------------
  const header = document.querySelector('.header');
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --------------------------------------------------------
  // Mobile menu
  // --------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('a');

  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    nav.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMenu();
  });

  // --------------------------------------------------------
  // Smooth scroll with header offset
  // --------------------------------------------------------
  const headerHeight = () => document.querySelector('.header').offsetHeight || 80;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (headerHeight() - 10);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // --------------------------------------------------------
  // Reveal on scroll
  // --------------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger slightly when multiple are visible
            setTimeout(() => entry.target.classList.add('is-visible'), Math.min(i * 70, 240));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // --------------------------------------------------------
  // Active nav link based on section
  // --------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-list a');

  if ('IntersectionObserver' in window && sections.length) {
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navAnchors.forEach((a) => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-50% 0px -45% 0px' }
    );
    sections.forEach((s) => navIO.observe(s));
  }

  // --------------------------------------------------------
  // WhatsApp phone mask (BR format)
  // --------------------------------------------------------
  const phoneInput = document.getElementById('whatsapp');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4}).*/, '($1) $2 $3-$4');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d*)/, '($1');
      }
      e.target.value = v;
    });
  }

  // --------------------------------------------------------
  // Form submission → opens WhatsApp with prefilled message
  // --------------------------------------------------------
  const form = document.getElementById('leadForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fields = ['nome', 'whatsapp', 'cidade', 'ambiente'];
      let valid = true;

      fields.forEach((id) => {
        const el = document.getElementById(id);
        if (!el.value.trim()) {
          el.classList.add('error');
          valid = false;
        } else {
          el.classList.remove('error');
        }
      });

      // Basic phone validation
      const phone = document.getElementById('whatsapp');
      const phoneDigits = phone.value.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        phone.classList.add('error');
        valid = false;
      }

      if (!valid) {
        const firstError = form.querySelector('.error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const nome = document.getElementById('nome').value.trim();
      const whats = phone.value.trim();
      const cidade = document.getElementById('cidade').value.trim();
      const ambiente = document.getElementById('ambiente').value;
      const mensagem = document.getElementById('mensagem').value.trim();

      const lines = [
        `Olá! Vim pelo site da Essenzia Movelaria.`,
        ``,
        `*Nome:* ${nome}`,
        `*WhatsApp:* ${whats}`,
        `*Cidade:* ${cidade}`,
        `*Ambiente:* ${ambiente}`,
      ];

      if (mensagem) {
        lines.push(``, `*Detalhes do projeto:*`, mensagem);
      }

      lines.push(``, `Gostaria de solicitar um orçamento.`);

      const text = encodeURIComponent(lines.join('\n'));
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

      // Show success state
      if (formSuccess) {
        formSuccess.hidden = false;
      }

      // Open WhatsApp shortly after success state appears
      setTimeout(() => {
        window.open(url, '_blank', 'noopener');
      }, 400);

      // Reset form after a few seconds (in case user returns)
      setTimeout(() => {
        form.reset();
        if (formSuccess) formSuccess.hidden = true;
      }, 6000);
    });

    // Clear error on input
    form.querySelectorAll('input, select, textarea').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('error'));
      el.addEventListener('change', () => el.classList.remove('error'));
    });
  }

  // --------------------------------------------------------
  // Performance: lazy reveal of heavy gradients/images
  // (already CSS-only — no JS image loading needed)
  // --------------------------------------------------------
})();
