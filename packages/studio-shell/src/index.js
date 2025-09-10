(function() {
  const listeners = new Map();
  const slots = new Map();
  const validSlots = new Set([
    'slot-templateRow',
    'slot-left',
    'slot-center',
    'slot-right'
  ]);

  let state = Object.freeze({
    theme: 'light',
    viewport: 'desktop',
    leftCollapsed: false,
    rightCollapsed: false,
    panel: null
  });

  let readyResolve;
  const readyPromise = new Promise((resolve) => { readyResolve = resolve; });
  let readyFired = false;

  function freeze(obj) { return Object.freeze({ ...obj }); }

  function emit(event, payload) {
    const frozen = freeze(payload || {});
    const cbs = listeners.get(event);
    if (cbs) {
      cbs.forEach(cb => { try { cb(frozen); } catch (e) { setTimeout(() => { throw e; }); } });
    }
  }

  const validEvents = new Set(['studio:ready','studio:theme','studio:viewport','studio:panel']);

  function on(event, handler) {
    if (!validEvents.has(event)) throw new Error(`Unknown event: ${event}`);
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event)?.delete(handler);
  }

  function ensureSlotId(slotId) {
    if (!validSlots.has(slotId)) throw new Error(`Unknown slot: ${slotId}`);
    const el = document.getElementById(slotId);
    if (!el) throw new Error(`Slot element not found: ${slotId}`);
    return el;
  }

  function getSlot(slotId) {
    ensureSlotId(slotId);
    return slots.get(slotId) || null;
  }

  function mount(slotId, node) {
    const slotEl = ensureSlotId(slotId);
    if (slots.has(slotId)) throw new Error(`Slot already mounted: ${slotId}`);
    if (!(node instanceof Node)) throw new Error('mount expects a DOM Node');
    // Clear existing children before mount
    slotEl.replaceChildren(node);
    slots.set(slotId, node);
    return node;
  }

  function unmount(slotId) {
    ensureSlotId(slotId);
    if (!slots.has(slotId)) throw new Error(`Slot not mounted: ${slotId}`);
    const slotEl = document.getElementById(slotId);
    slotEl.replaceChildren();
    slots.delete(slotId);
  }

  function applyThemeViewport() {
    const center = document.getElementById('centerCanvas');
    if (!center) return;
    // remove previous classes
    center.classList.remove('studio-theme-light','studio-theme-dark','studio-viewport-desktop','studio-viewport-mobile');
    center.classList.add(`studio-theme-${state.theme}`);
    center.classList.add(`studio-viewport-${state.viewport}`);
  }

  function setTheme(theme, source = 'host') {
    if (!['light','dark'].includes(theme)) throw new Error('Invalid theme');
    state = freeze({ ...state, theme });
    applyThemeViewport();
    emit('studio:theme', { theme, source });
    return theme;
  }

  function setViewport(viewport, source = 'host') {
    if (!['desktop','mobile'].includes(viewport)) throw new Error('Invalid viewport');
    state = freeze({ ...state, viewport });
    applyThemeViewport();
    emit('studio:viewport', { viewport, source });
    return viewport;
  }

  function togglePanel(which, collapsed, source = 'host') {
    if (!['left','right'].includes(which)) throw new Error('Invalid panel');
    const key = which === 'left' ? 'leftCollapsed' : 'rightCollapsed';
    const value = typeof collapsed === 'boolean' ? collapsed : !state[key];
    state = freeze({ ...state, [key]: value, panel: which });
    const el = document.getElementById(which === 'left' ? 'slot-left' : 'slot-right');
    if (el) el.classList.toggle('collapsed', value);
    emit('studio:panel', { panel: which, collapsed: value, source });
    return value;
  }

  function getState() { return state; }

  function destroy() {
    // remove listeners
    listeners.clear();
    // unmount slots
    Array.from(slots.keys()).forEach(unmount);
  }

  function ready() {
    if (!readyFired) {
      readyFired = true;
      applyThemeViewport();
      const s = getState();
      const payload = { state: s };
      emit('studio:ready', payload);
      readyResolve(s);
    }
    return readyPromise;
  }

  // Expose global
  const api = {
    ready,
    destroy,
    on,
    getSlot,
    mount,
    unmount,
    getState,
    setTheme,
    setViewport,
    togglePanel
  };

  // Attach to window.Studio (UMD iife global-name will also set this)
  if (typeof window !== 'undefined') {
    window.Studio = api;
  }
})();


