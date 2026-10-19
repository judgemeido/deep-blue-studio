import { CHAPTERS, MILESTONES } from './history/chapters.js';
import { renderHistory } from './history/render-history.js';
import { createMilestoneController } from './history/milestone-controller.js';

const app = document.querySelector('[data-history-app]');
const root = document.querySelector('[data-history-preview]');

if (app && root) {
  renderHistory(app, { chapters: CHAPTERS, milestones: MILESTONES });
  createMilestoneController(root, MILESTONES);

  const scenes = [...root.querySelectorAll('[data-history-scene]')];
  const links = [...root.querySelectorAll('[data-scene-link]')];
  const drawer = root.querySelector('[data-directory-drawer]');
  const directoryToggle = drawer?.querySelector('[data-directory-toggle]');
  const directoryToggleLabel = directoryToggle?.querySelector('.directory-toggle-label');
  const directoryCurrentLabel = directoryToggle?.querySelector('[data-directory-current-label]');
  const directoryActs = [...root.querySelectorAll('[data-directory-act]')];
  const directoryCurrent = drawer?.querySelector('[data-directory-current]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let currentScene;

  function setDirectoryOpen(open, { returnFocus = false } = {}) {
    if (!drawer || !directoryToggle) return;
    const next = Boolean(open);
    drawer.dataset.directoryOpen = String(next);
    directoryToggle.setAttribute('aria-expanded', String(next));
    if (directoryToggleLabel) directoryToggleLabel.textContent = next ? '关闭目录' : '打开目录';
    if (returnFocus) directoryToggle.focus({ preventScroll: true });
  }

  function setDirectoryAct(act) {
    if (!drawer || !directoryActs.length) return;
    const nextAct = Number(act);
    if (!Number.isFinite(nextAct)) return;
    drawer.dataset.directoryCurrentAct = String(nextAct);
    for (const section of directoryActs) {
      const active = Number(section.dataset.directoryAct) === nextAct;
      section.toggleAttribute('data-directory-active', active);
      section.hidden = !active;
    }
  }

  function scrollActiveLinkIntoView() {
    if (drawer?.dataset.directoryOpen !== 'true') return;
    const activeLink = links.find(link => link.getAttribute('aria-current') === 'location');
    if (!activeLink || typeof activeLink.scrollIntoView !== 'function') return;
    activeLink.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function setCurrentScene(scene) {
    if (!scene) return;
    currentScene = scene;
    for (const link of links) {
      if (link.getAttribute('href') === `#${scene.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    setDirectoryAct(scene.dataset.act);
    if (directoryCurrentLabel) {
      const actSection = directoryActs.find(section => section.dataset.directoryAct === String(scene.dataset.act));
      const ordinal = String(scene.dataset.chapter ?? '').replace(/^ch/i, '').padStart(2, '0');
      const actLabel = actSection?.querySelector('header > span')?.textContent ?? `第 ${scene.dataset.act} 幕`;
      directoryCurrentLabel.textContent = `${ordinal} · ${actLabel}`;
    }
    scrollActiveLinkIntoView();
  }

  function updateCurrent() {
    const line = innerHeight * 0.25;
    let current;
    let distance = Infinity;
    for (const scene of scenes) {
      if (!scene.classList.contains('is-revealed')) continue;
      const next = Math.abs(scene.getBoundingClientRect().top - line);
      if (next < distance) {
        distance = next;
        current = scene;
      }
    }
    if (!current && currentScene) current = currentScene;
    if (!current) {
      const hashTarget = scenes.find(scene => `#${scene.id}` === location.hash);
      if (hashTarget) current = hashTarget;
    }
    if (current) setCurrentScene(current);
  }

  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('is-revealed');
      }
      updateCurrent();
    }, { rootMargin: '-12% 0px -55% 0px', threshold: 0 });
    scenes.forEach(scene => observer.observe(scene));
    addEventListener('scroll', updateCurrent, { passive: true });
    addEventListener('resize', updateCurrent);
  } else {
    scenes.forEach(scene => scene.classList.add('is-revealed'));
    updateCurrent();
  }

  directoryToggle?.addEventListener('click', () => {
    setDirectoryOpen(drawer.dataset.directoryOpen !== 'true');
  });

  directoryCurrent?.addEventListener('click', () => {
    if (!currentScene) return;
    currentScene.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    currentScene.querySelector('h2, h1')?.focus?.({ preventScroll: true });
    setDirectoryOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer?.dataset.directoryOpen === 'true') setDirectoryOpen(false, { returnFocus: true });
  });

  for (const link of links) {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target?.matches('[data-history-scene]')) setCurrentScene(target);
      setDirectoryOpen(false);
      target?.querySelector('h2, h1')?.focus?.({ preventScroll: true });
    });
  }
  addEventListener('hashchange', updateCurrent);
  updateCurrent();
}

