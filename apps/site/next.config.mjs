export default {
  i18n: { locales: ['en','it'], defaultLocale: 'en' },
  headers: async () => [{
    source: "/(.*)",
    headers: [
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
    ]
  }]
};
