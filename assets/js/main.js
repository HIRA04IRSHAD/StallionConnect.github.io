/* Stallion Connect Pvt Ltd — site scripts */

/*
 * Form submissions
 * Paste a form endpoint here (for example from formspree.io) to receive
 * enquiries and job applications by email. While it is empty the forms run
 * in demo mode: they show the thank-you message but nothing is sent.
 */
const FORM_ENDPOINT = '';

const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');

/* Header: add a shadow once the page scrolls */
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* Mobile menu */
const setMenu = (open) => {
  header.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

navToggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
header.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && header.classList.contains('nav-open')) {
    setMenu(false);
    navToggle.focus();
  }
});
window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => {
  if (e.matches) setMenu(false);
});

/* Reveal sections as they scroll into view */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => revealer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* Services page: highlight the sub-nav pill for the section in view */
const subnav = document.querySelector('.subnav-track');
if (subnav) {
  const links = new Map([...subnav.querySelectorAll('a')].map((a) => [a.hash.slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = links.get(entry.target.id);
      links.forEach((a) => a.classList.toggle('is-active', a === active));
      if (active) subnav.scrollTo({ left: active.offsetLeft - 16, behavior: 'smooth' });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  });
}

/* Careers page: "Apply" buttons pre-select the role in the form */
document.querySelectorAll('[data-apply]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const position = document.getElementById('position');
    if (position) position.value = btn.dataset.apply;
  });
});

/* Contact page: pre-select the service when arriving from contact.html?service=… */
const serviceSelect = document.getElementById('service');
const requestedService = new URLSearchParams(window.location.search).get('service');
if (serviceSelect && requestedService && [...serviceSelect.options].some((o) => o.value === requestedService)) {
  serviceSelect.value = requestedService;
}

/* Forms: browser validation runs first, then we submit with fetch */
document.querySelectorAll('form[data-form]').forEach((form) => {
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const label = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        console.warn('Stallion Connect: FORM_ENDPOINT is empty, so this form ran in demo mode and nothing was sent.');
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
      form.reset();
      status.textContent = form.dataset.success;
      status.classList.add('is-success');
    } catch (err) {
      status.textContent = 'Sorry, something went wrong. Please call or email us instead.';
      status.classList.add('is-error');
    } finally {
      submit.disabled = false;
      submit.innerHTML = label;
    }
  });
});

/* Footer year */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
