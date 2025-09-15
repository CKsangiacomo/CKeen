1) Build bundle
   pnpm build:embed

2) Size check
   pnpm size:embed
   # Expect: under 28 KB gzip

3) Loader path
   <script src="http://localhost:3000/e/w_demo?token=et_VALID" async></script>
   - Should fetch cfg, import /embed-bundle.js, and render the contact form.

4) Preview update (after PR#8)
   - Studio posts { type: 'ckeen:preview:update', widgetId:'...', cfg:{ theme:'dark' } }
   - Runtime should react (to be completed in PR#8 wiring).


