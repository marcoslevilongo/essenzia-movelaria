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
  // Form: inline blur validation + submit → WhatsApp
  // (UI Pro Max: forms — inline-validation, error-clarity, submit-feedback)
  // --------------------------------------------------------
  const form = document.getElementById('leadForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  const VALIDATORS = {
    nome: {
      check: (v) => v.trim().length >= 2,
      msg: 'Por favor, informe seu nome completo.',
    },
    whatsapp: {
      check: (v) => v.replace(/\D/g, '').length >= 10,
      msg: 'Informe um WhatsApp válido com DDD.',
    },
    cidade: {
      check: (v) => v.trim().length >= 2,
      msg: 'Informe a sua cidade.',
    },
    ambiente: {
      check: (v) => v.trim().length > 0,
      msg: 'Selecione um tipo de ambiente.',
    },
  };

  const setFieldError = (id, msg) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(`${id}-error`);
    if (!el) return;
    if (msg) {
      el.classList.add('error');
      el.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.textContent = msg;
    } else {
      el.classList.remove('error');
      el.removeAttribute('aria-invalid');
      if (errEl) errEl.textContent = '';
    }
  };

  const validateField = (id) => {
    const el = document.getElementById(id);
    if (!el) return true;
    const v = el.value;
    // Only show error if user has tried to fill it
    if (!VALIDATORS[id]) return true;
    if (!VALIDATORS[id].check(v)) {
      setFieldError(id, VALIDATORS[id].msg);
      return false;
    }
    setFieldError(id, '');
    return true;
  };

  if (form) {
    // Validate on blur (after first interaction)
    Object.keys(VALIDATORS).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', () => {
        if (el.dataset.touched === 'true') validateField(id);
      });
      el.addEventListener('input', () => {
        el.dataset.touched = 'true';
        // Clear error live as user fixes it
        if (el.classList.contains('error')) {
          if (VALIDATORS[id].check(el.value)) setFieldError(id, '');
        }
      });
      el.addEventListener('change', () => {
        el.dataset.touched = 'true';
        validateField(id);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Force-validate all fields
      let valid = true;
      Object.keys(VALIDATORS).forEach((id) => {
        if (!validateField(id)) valid = false;
      });

      if (!valid) {
        const firstError = form.querySelector('.error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Loading state on submit button
      if (submitBtn) submitBtn.dataset.loading = 'true';

      const nome = document.getElementById('nome').value.trim();
      const whats = document.getElementById('whatsapp').value.trim();
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

      // Brief loading state, then show success + open WhatsApp
      setTimeout(() => {
        if (formSuccess) formSuccess.hidden = false;
        window.open(url, '_blank', 'noopener');
      }, 500);

      // Reset after a few seconds
      setTimeout(() => {
        form.reset();
        if (formSuccess) formSuccess.hidden = true;
        if (submitBtn) delete submitBtn.dataset.loading;
        // Clear all errors
        Object.keys(VALIDATORS).forEach((id) => setFieldError(id, ''));
        // Reset touched flags
        form.querySelectorAll('[data-touched]').forEach((el) => {
          delete el.dataset.touched;
        });
      }, 6500);
    });
  }

  // --------------------------------------------------------
  // Stats counter animation (triggers when section is in view)
  // (UI Pro Max: trust signals — animate to feel alive)
  // --------------------------------------------------------
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateNum = (el) => {
      const target = parseInt(el.dataset.target || '0', 10);
      if (prefersReduced || target <= 0) {
        el.textContent = target;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target).toString();
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target.toString();
      };
      requestAnimationFrame(tick);
    };

    const statIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateNum(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    statNums.forEach((el) => statIO.observe(el));
  }

  // --------------------------------------------------------
  // Performance: lazy reveal of heavy gradients/images
  // (already CSS-only — no JS image loading needed)
  // --------------------------------------------------------
})();
