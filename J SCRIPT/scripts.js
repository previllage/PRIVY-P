// js/script.js
// Privy Pink - main site interactions (nav, products, search, gallery, forms, feed, accessibility)
// Place this file at js/script.js and include with <script src="js/script.js" defer></script>

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------
     Utility helpers
     -------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function debounce(fn, wait = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  }

  // Set current year where #year exists
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------------------------
     NAV / HAMBURGER (accessible)
     -------------------------- */
  (function initNav() {
    const hamburger = $('#hamburger');
    const navMenu = $('#nav-menu');

    if (!hamburger || !navMenu) return;

    // Initialize attributes
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.setAttribute('aria-hidden', 'true');

    function openNav() {
      hamburger.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');
    }
    function closeNav() {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-hidden', 'true');
    }
    function toggleNav() {
      if (hamburger.getAttribute('aria-expanded') === 'true') closeNav();
      else openNav();
    }

    hamburger.addEventListener('click', toggleNav);
    // Close nav when a link is clicked (mobile)
    $$('#nav-menu a').forEach(a => a.addEventListener('click', () => {
      if (window.innerWidth < 880) closeNav();
    }));

    // Close nav with Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Close nav on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 880) {
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'false');
      } else {
        navMenu.setAttribute('aria-hidden', 'true');
      }
    });
  })();

  /* --------------------------
     PRODUCTS: data + injection + search
     -------------------------- */
  const PRODUCTS = [
    {
      id: 'p1',
      name: 'Olive & Rosemary Hair Oil',
      desc: 'Nourishing oil with olive oil, rosemary and vitamin E.',
      img: 'images/product1.jpg',
      imgLarge: 'images/product1-large.jpg',
      ingredients: ['Olive oil', 'Rosemary', 'Vitamin E'],
    },
    {
      id: 'p2',
      name: 'Chebe Growth Cream',
      desc: 'Strengthening cream with chebe, vitamin E and shea butter.',
      img: 'images/product2.jpg',
      imgLarge: 'images/product2-large.jpg',
      ingredients: ['Chebe', 'Vitamin E', 'Shea butter'],
    },
    {
      id: 'p3',
      name: 'Rose Perfume',
      desc: 'Light perfume with rose essence for a fresh scent.',
      img: 'images/product3.jpg',
      imgLarge: 'images/product3-large.jpg',
      ingredients: ['Rose essence', 'Alcohol', 'Fragrance'],
    }
  ];

  function createProductCard(p) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.name = p.name.toLowerCase();
    article.innerHTML = `
      <a href="${p.imgLarge}" class="gallery-link" aria-label="Open ${escapeHtml(p.name)} image"><img src="${p.img}" alt="${escapeHtml(p.name)}"></a>
      <h3>${escapeHtml(p.name)}</h3>
      <p>${escapeHtml(p.desc)}</p>
      <p class="muted">Ingredients: ${p.ingredients.join(', ')}</p>
      <p style="margin-top:.6rem"><a class="btn small" href="enquiry.html?product=${encodeURIComponent(p.name)}">Enquire</a></p>
    `;
    return article;
  }

  function injectProducts() {
    const grid = $('#productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    PRODUCTS.forEach(p => grid.appendChild(createProductCard(p)));
  }
  injectProducts();

  // Search filtering
  (function initSearch() {
    const search = $('#search');
    const grid = $('#productGrid');
    if (!search || !grid) return;
    const handle = debounce(() => {
      const q = search.value.trim().toLowerCase();
      grid.querySelectorAll('.product-card').forEach(card => {
        const text = (card.textContent || '').toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    }, 180);
    search.addEventListener('input', handle);
  })();

  /* --------------------------
     LIGHTBOX / GALLERY
     -------------------------- */
  (function initLightbox() {
    let lb = null;

    function createLightbox() {
      lb = document.createElement('div');
      lb.className = 'lightbox';
      lb.innerHTML = `
        <div class="lightbox-inner">
          <button class="close" aria-label="Close image">&times;</button>
          <img alt="">
        </div>
      `;
      document.body.appendChild(lb);

      lb.querySelector('.close').addEventListener('click', () => lb.classList.remove('open'));
      lb.addEventListener('click', (e) => {
        if (e.target === lb) lb.classList.remove('open');
      });
      // close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lb.classList.contains('open')) lb.classList.remove('open');
      });
    }

    document.body.addEventListener('click', (e) => {
      const a = e.target.closest('.gallery-link');
      if (!a) return;
      e.preventDefault();
      if (!lb) createLightbox();
      const img = lb.querySelector('img');
      img.src = a.getAttribute('href');
      img.alt = (a.querySelector('img') || {}).alt || '';
      lb.classList.add('open');
      // focus close button for accessibility
      setTimeout(() => lb.querySelector('.close').focus(), 50);
    });
  })();

  /* --------------------------
     ACCORDION (FAQ)
     -------------------------- */
  (function initAccordion() {
    $$('.accordion .accordion-title').forEach(title => {
      title.setAttribute('aria-expanded', 'false');
      // ensure content starts closed
      const item = title.closest('.accordion-item');
      const content = item && item.querySelector('.accordion-content');
      if (content) content.style.maxHeight = null;

      title.addEventListener('click', () => {
        const expanded = title.getAttribute('aria-expanded') === 'true';
        title.setAttribute('aria-expanded', String(!expanded));
        if (content) content.style.maxHeight = !expanded ? content.scrollHeight + 'px' : null;
      });

      // keyboard support
      title.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          title.click();
        }
      });
    });
  })();

  /* --------------------------
     TABS (if any)
     -------------------------- */
  (function initTabs() {
    $$('.tabs').forEach(tabs => {
      const buttons = $$('.tab-button', tabs);
      const panels = $$('.tab-panel', tabs);
      if (!buttons.length || !panels.length) return;
      buttons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          panels[idx].classList.add('active');
          btn.focus();
        });
      });
      // activate first by default
      buttons[0] && buttons[0].click();
    });
  })();

  /* --------------------------
     MODAL support (data-open-modal, id)
     -------------------------- */
  (function initModal() {
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-modal]');
      if (!btn) return;
      const id = btn.getAttribute('data-open-modal');
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('open');
    });
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal .close')) e.target.closest('.modal').classList.remove('open');
      if (e.target.matches('.modal')) e.target.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal.open').forEach(m => m.classList.remove('open'));
      }
    });
  })();

  /* --------------------------
     SIMULATED REAL-TIME FEED (demo mode)
     -------------------------- */
  (function initRealTimeFeed() {
    const feedEl = $('#liveFeed');
    if (!feedEl) return;
    const messages = [
      'New enquiry: Olive & Rosemary Hair Oil — Maria',
      'Stock update: Chebe Growth Cream low stock',
      'New message: Request for workshop kits',
      'New order: Rose Perfume — 2 units'
    ];
    let i = 0;
    setInterval(() => {
      const item = document.createElement('div');
      item.className = 'feed-item';
      item.textContent = `${new Date().toLocaleTimeString()} — ${messages[i % messages.length]}`;
      feedEl.prepend(item);
      i++;
      while (feedEl.children.length > 6) feedEl.removeChild(feedEl.lastChild);
    }, 4500);
  })();

  /* --------------------------
     ENQUIRY FORM validation + simulated submit
     (id="#enquiryForm", result in #formMessage)
     -------------------------- */
  (function initEnquiryForm() {
    const form = $('#enquiryForm');
    const msgEl = $('#formMessage');
    if (!form) return;

    // prefill product from query string: ?product=Name
    const params = new URLSearchParams(window.location.search || '');
    const pre = params.get('product');
    if (pre) {
      const sel = form.querySelector('#product');
      if (sel) {
        // add option if missing
        if (![...sel.options].some(o => o.value === pre)) {
          const opt = new Option(pre, pre);
          sel.add(opt, 0);
        }
        sel.value = pre;
      }
    }

    function show(text, ok = true) {
      if (!msgEl) return;
      msgEl.textContent = text;
      msgEl.style.color = ok ? 'green' : 'red';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const phone = form.querySelector('#phone');
      const product = form.querySelector('#product');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name.value.trim() || !emailRegex.test(email.value) || !phone.value.trim() || !product.value) {
        show('Please complete all required fields with valid details.', false);
        return;
      }

      show('Submitting enquiry...');
      // simulate network delay
      setTimeout(() => {
        show('Thank you — your enquiry has been submitted. We will contact you soon.', true);
        form.reset();
      }, 700);
    });
  })();

  /* --------------------------
     CONTACT FORM (Formspree ready)
     (id="#contactForm", result in #contactMessage)
     -------------------------- */
  (function initContactForm() {
    const form = $('#contactForm');
    const msgEl = $('#contactMessage');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.action || form.action.includes('YOUR_ID')) {
        // no real backend configured — show friendly message
        (msgEl || {}).textContent = 'This form is not configured to send email yet. Set a Formspree endpoint in the form action.';
        (msgEl || {}).style.color = 'orange';
        return;
      }
      (msgEl || {}).textContent = 'Sending...';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          (msgEl || {}).style.color = 'green';
          (msgEl || {}).textContent = 'Message sent. Thank you!';
          form.reset();
        } else {
          const data = await res.json();
          (msgEl || {}).style.color = 'red';
          (msgEl || {}).textContent = data?.error || 'Error sending message.';
        }
      } catch (err) {
        (msgEl || {}).style.color = 'red';
        (msgEl || {}).textContent = 'Network error. Please try again later.';
      }
    });
  })();

  /* --------------------------
     EXTRA: smooth internal anchor scrolling
     -------------------------- */
  (function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  })();

  /* --------------------------
     Small helpers
     -------------------------- */
  function escapeHtml(s = '') {
    return s.replaceAll ? s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;') : s;
  }

  // expose for debugging (optional)
  window._privy = {
    PRODUCTS,
    injectProducts,
  };
});
