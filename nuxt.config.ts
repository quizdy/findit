// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  runtimeConfig: {
    public: {
      GMAP_API_KEY: process.env.GMAP_API_KEY
    },
  },
  app: {
    head: {
      title: "Find it",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent'},
        { name: "mobile-web-app-capable", content: "yes" },
      ],
      link: [
        { rel: 'apple-touch-icon', type: 'image/png', href: '/apple-touch-icon-180x180.png' }
      ],
      style: [
        {
          children:
            "body { margin: 0; padding: 0; min-height: 100vh; min-height: -webkit-fill-available;}",
        },
      ],
    },
  },
  css: ['vuetify/lib/styles/main.sass', "@mdi/font/css/materialdesignicons.css"],
  build: {
    transpile: ['vuetify'],
  },
  modules: [['nuxt-swiper', {
    prefix: 'Swiper',
    styleLang: 'css',
    modules: ['navigation', 'pagination'],
  }]],
};
