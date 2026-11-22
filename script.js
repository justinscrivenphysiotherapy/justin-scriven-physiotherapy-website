const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.nav-links');
const siteHeader = document.querySelector('.site-header');

const alignHeaderWordmark = () => {
  const name = siteHeader?.querySelector('.brand strong');
  const service = siteHeader?.querySelector('.brand small');
  if (!name || !service || !name.getClientRects().length) return;

  const nameRange = document.createRange();
  nameRange.selectNodeContents(name);
  const targetWidth = nameRange.getBoundingClientRect().width;
  service.style.letterSpacing = '0px';
  const serviceRange = document.createRange();
  serviceRange.selectNodeContents(service);
  const naturalWidth = serviceRange.getBoundingClientRect().width;
  const gaps = service.textContent.trim().length - 1;
  service.style.width = `${targetWidth}px`;
  service.style.letterSpacing = `${Math.max(0, (targetWidth - naturalWidth) / gaps)}px`;
};

alignHeaderWordmark();
document.fonts?.ready.then(alignHeaderWordmark);
window.addEventListener('resize', alignHeaderWordmark);

const updateHeader = () => {
  siteHeader?.classList.toggle('is-compact', window.scrollY > 64);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Close' : 'Menu';
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.textContent = 'Menu';
  });
});

const parallaxPhoto = document.querySelector('.physio-photo-parallax');
if (parallaxPhoto) {
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pendingFrame = 0;

  const updatePhoto = () => {
    pendingFrame = 0;
    const { top, height } = parallaxPhoto.getBoundingClientRect();
    const viewport = window.innerHeight;
    if (top >= viewport || top + height <= 0) return;

    const progress = (viewport - top) / (viewport + height);
    parallaxPhoto.style.setProperty('--photo-offset', `${(0.5 - progress) * 5}%`);
  };

  const queuePhotoUpdate = () => {
    if (!pendingFrame) pendingFrame = window.requestAnimationFrame(updatePhoto);
  };

  const syncPhotoMotion = () => {
    parallaxPhoto.toggleAttribute('data-parallax-active', !motionPreference.matches);
    if (motionPreference.matches) {
      window.removeEventListener('scroll', queuePhotoUpdate);
      window.removeEventListener('resize', queuePhotoUpdate);
      window.cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
    } else {
      window.addEventListener('scroll', queuePhotoUpdate, { passive: true });
      window.addEventListener('resize', queuePhotoUpdate);
      queuePhotoUpdate();
    }
  };

  motionPreference.addEventListener('change', syncPhotoMotion);
  syncPhotoMotion();
}
