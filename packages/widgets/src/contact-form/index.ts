export type ContactFormCfg = {
  title?: string;
  submitText?: string;
  theme?: 'light' | 'dark';
  props?: { title?: string; placeholder?: string };
};

/* Minimal runtime types */
export type RuntimeCtx = {
  publicId: string;
  token: string;
  cfg: any;            // { theme?, variant?, props? }
  apiBase?: string;
};

type WidgetHandle = {
  update: (nextCfg: any) => void;
  destroy: () => void;
};

import { getTokens } from '@ck/dieter-tokens';

export function renderContactForm(host: HTMLElement, ctx: RuntimeCtx): WidgetHandle {
  // Clean mount
  try { host.innerHTML = ''; } catch {}
  const root = document.createElement('div');
  root.setAttribute('data-ckeen', 'contact-form');
  host.appendChild(root);

  // State
  let cfg: any = ctx.cfg || {};
  let theme: string = (cfg.theme || 'light') as string;
  let t = getTokens(theme as any);

  // DOM nodes
  const form = document.createElement('form');
  form.style.all = 'revert';
  form.style.boxSizing = 'border-box';
  form.style.maxWidth = '420px';
  form.style.borderRadius = `${t.radius}px`;
  form.style.padding = `${t.pad}px`;

  const titleEl = document.createElement('div');
  titleEl.style.fontWeight = '600';
  titleEl.style.marginBottom = '12px';

  const box = document.createElement('div');
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.gap = `${t.gap}px`;

  const input = document.createElement('input');
  input.name = 'message';
  input.placeholder = 'Your message';

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = cfg.submitText ?? 'Send';
  button.style.padding = '10px 12px';
  button.style.borderRadius = '6px';
  button.style.fontWeight = '600';

  // Styling helpers
  function applyTheme(nextTheme: string) {
    theme = nextTheme === 'dark' ? 'dark' : 'light';
    t = getTokens(theme as any);
    form.style.background = t.bg;
    form.style.color = t.fg;
    form.style.border = `1px solid ${t.border}`;
    box.style.gap = `${t.gap}px`;
    input.style.all = 'revert';
    input.style.padding = '10px';
    input.style.border = `1px solid ${t.border}`;
    input.style.borderRadius = '6px';
    input.style.color = t.fg;
    input.style.background = t.bg;
    button.style.border = `1px solid ${t.accent}`;
    button.style.background = t.accent;
    button.style.color = t.bg;
  }

  function applyProps(p: any) {
    if (!p || typeof p !== 'object') return;
    if (typeof p.title === 'string') titleEl.textContent = p.title;
    if (typeof p.placeholder === 'string') input.placeholder = p.placeholder;
  }

  // Attach
  form.appendChild(titleEl);
  box.appendChild(input);
  form.appendChild(box);
  form.appendChild(button);
  root.appendChild(form);

  // Initial apply
  titleEl.textContent = (cfg.props?.title as string) || cfg.title || 'Contact us';
  input.placeholder = (cfg.props?.placeholder as string) || 'Your message';
  applyTheme(theme);
  applyProps(cfg.props);

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
  });

  const handle: WidgetHandle = {
    update(nextCfg: any) {
      if (!nextCfg || typeof nextCfg !== 'object') return;
      const prevTheme = theme;
      cfg = { ...cfg, ...nextCfg };
      if (nextCfg.theme && nextCfg.theme !== prevTheme) applyTheme(String(nextCfg.theme));
      if (nextCfg.props && typeof nextCfg.props === 'object') applyProps(nextCfg.props);
      if (typeof nextCfg.submitText === 'string') button.textContent = nextCfg.submitText;
    },
    destroy() {
      try { host.innerHTML = ''; } catch {}
    }
  };

  return handle;
}


