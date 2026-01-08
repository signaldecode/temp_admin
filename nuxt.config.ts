// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  // 모듈 설정
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
  ],

  // 앱 설정
  app: {
    head: {
      title: 'Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'Admin Dashboard' },
        { name: 'theme-color', content: '#1e40af' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // CSS 설정
  css: ['~/assets/css/main.css'],

  // 런타임 설정 (환경변수 기반)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      // Phase 1: 단일 서비스 식별자 (Phase 2에서 동적으로 변경 가능)
      defaultTenantId: process.env.NUXT_PUBLIC_DEFAULT_TENANT_ID || 'default',
    },
  },

  // Tailwind 설정
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  // Pinia 설정
  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  // PWA 설정
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Admin Dashboard',
      short_name: 'Admin',
      description: 'Admin Dashboard PWA',
      theme_color: '#1e40af',
      background_color: '#f8fafc',
      display: 'standalone',
      start_url: '/admin',
      icons: [
        {
          src: '/icons/icon-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
        },
        {
          src: '/icons/icon-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
        },
      ],
    },
    workbox: {
      // 정적 자산만 캐싱 (API 캐싱 금지)
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      navigateFallback: null,
      // API 요청은 캐싱하지 않음
      runtimeCaching: [],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },

  // 라우터 설정
  routeRules: {
    // Admin 페이지는 CSR (인증 필요)
    '/admin/**': { ssr: false },
    '/login': { ssr: false },
  },
})
