import pkg from "./package.json";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: {
    viewTransition: true,
  },

  nitro: {
    preset: 'node-server'
  },

  app: {
    head: {
      title: pkg.name,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: pkg.version },
      ],
    },
  },

  // ssr: false, // for netlify deploy
  // devtools: { enabled: true },
  css: [
    // 'tachyons/css/tachyons.css',
    "vue-toast-notification/dist/theme-default.css",
  ],

  modules: [
    [
      "@nuxtjs/supabase",
      {
        redirectOptions: {
          // exclude: ["/", "/ig", ],
          exclude: ["/*"],
          include: ["/admin", "/screenshots"],
        },
      },
    ],
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    "@vueuse/motion/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Figtree: [400, 700],
          "Fira Code": [400, 700],
          "Fjalla One": [400],
        },
      },
    ],
    // ['nuxt-perfect-cache',
    //   {
    //     disable: false,
    //     appendHost: true,
    //     ignoreConnectionErrors: false,
    //     prefix: 'r-',
    //     url: 'redis://127.0.0.1:6379',
    //     getCacheData(route, context) {
    //       if (route === '/api/latest-photos') {
    //         return { key: 'latest-photos', expire: 60 * 5 }; // 5 minutes
    //       }
    //       return false;
    //     },
    //   },
    // ]
  ],

  runtimeConfig: {
    // add the openai api key to the runtime config
    public: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PRODUCTION: process.env.PRODUCTION,
    },
  },

  compatibilityDate: "2025-07-08",
});