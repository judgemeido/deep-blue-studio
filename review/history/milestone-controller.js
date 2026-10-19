/**
 * Wire the shared milestone dialog to chapter triggers.
 *
 * The renderer owns the markup; this controller only supplies milestone data
 * and keeps the dialog's keyboard and focus behavior predictable.
 */
export function createMilestoneController(root, milestones = []) {
  if (!root) return { open() {}, close() {}, destroy() {} };

  const dialog = root.querySelector?.('#milestone-dialog');
  if (!dialog) return { open() {}, close() {}, destroy() {} };

  const records = new Map();
  if (Array.isArray(milestones)) {
    for (const milestone of milestones) {
      if (milestone?.chapterId) records.set(String(milestone.chapterId), milestone);
    }
  } else if (milestones && typeof milestones === 'object') {
    for (const [chapterId, milestone] of Object.entries(milestones)) {
      if (milestone) records.set(String(chapterId), milestone);
    }
  }

  const query = selector => dialog.querySelector?.(selector);
  const label = query('[data-milestone-label]');
  const title = query('[data-milestone-title]');
  const detail = query('[data-milestone-detail]');
  const image = query('[data-milestone-image]');
  const caption = query('[data-milestone-caption]');
  const people = query('[data-milestone-people]');
  const place = query('[data-milestone-place]');
  const closeButton = query('.dialog-close');
  let activeTrigger = null;
  let disposed = false;

  if (!dialog.hasAttribute?.('tabindex') && dialog.setAttribute) dialog.setAttribute('tabindex', '-1');

  const focusDialog = () => {
    const target = closeButton || title || dialog;
    target?.focus?.({ preventScroll: true });
  };

  const restoreFocus = () => {
    const trigger = activeTrigger;
    activeTrigger = null;
    trigger?.focus?.({ preventScroll: true });
  };

  const setContent = milestone => {
    if (!milestone) return;
    if (label) label.textContent = milestone.label ?? '重要节点';
    if (title) title.textContent = milestone.title ?? '';
    if (detail) detail.textContent = milestone.detail ?? '';
    if (caption) caption.textContent = milestone.caption ?? '';
    if (people) people.textContent = Array.isArray(milestone.people) ? milestone.people.join('、') : String(milestone.people ?? '');
    if (place) place.textContent = milestone.place ?? '';
    if (image) {
      image.src = milestone.image ?? '';
      image.alt = milestone.imageAlt ?? milestone.title ?? '';
    }
  };

  const isOpen = () => Boolean(dialog.open || dialog.hasAttribute?.('open'));

  const close = () => {
    if (!isOpen()) {
      restoreFocus();
      return;
    }
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute?.('open');
    restoreFocus();
  };

  const open = idOrMilestone => {
    if (disposed) return;
    const isTrigger = Boolean(idOrMilestone && typeof idOrMilestone.getAttribute === 'function');
    const requestedId = typeof idOrMilestone === 'string'
      ? idOrMilestone.replace(/^milestone-/, '')
      : idOrMilestone?.chapterId;
    const trigger = isTrigger
      ? idOrMilestone
      : root.querySelector?.(`[data-milestone-id="${requestedId}"]`) || root.querySelector?.(`[data-milestone-trigger="milestone-${requestedId}"]`);
    const chapterId = trigger?.getAttribute?.('data-milestone-id') || requestedId;
    const milestone = typeof idOrMilestone === 'object' && !isTrigger
      ? idOrMilestone
      : records.get(String(chapterId));
    if (!milestone) return;

    activeTrigger = trigger || null;
    setContent(milestone);
    dialog.dataset.milestoneId = String(chapterId ?? '');
    if (!isOpen()) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute?.('open', '');
    }
    focusDialog();
  };

  const onRootClick = event => {
    const trigger = event.target?.closest?.('[data-milestone-trigger]');
    if (!trigger || !root.contains?.(trigger)) return;
    event.preventDefault?.();
    open(trigger);
  };

  const onDialogClick = event => {
    if (event.target === dialog) close();
  };

  const onDialogKeydown = event => {
    if (event.key === 'Escape') {
      event.preventDefault?.();
      close();
    }
  };

  const onDialogClose = () => restoreFocus();
  const onCloseButtonClick = event => {
    event.preventDefault?.();
    close();
  };
  root.addEventListener?.('click', onRootClick);
  dialog.addEventListener?.('click', onDialogClick);
  dialog.addEventListener?.('keydown', onDialogKeydown);
  dialog.addEventListener?.('close', onDialogClose);
  closeButton?.addEventListener?.('click', onCloseButtonClick);

  return {
    open,
    close,
    destroy() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener?.('click', onRootClick);
      dialog.removeEventListener?.('click', onDialogClick);
      dialog.removeEventListener?.('keydown', onDialogKeydown);
      dialog.removeEventListener?.('close', onDialogClose);
      closeButton?.removeEventListener?.('click', onCloseButtonClick);
      activeTrigger = null;
    },
  };
}

