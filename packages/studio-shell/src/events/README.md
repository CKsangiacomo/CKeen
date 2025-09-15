- Use `createBus()` once at app bootstrap and provide via context.
- For preview updates, post messages to the preview iframe:
  `iframe.contentWindow?.postMessage({ type: 'ckeen:preview:update', widgetId, cfg }, '*')`
- Venice/runtime will listen for 'ckeen:preview:update' in PR#7.


