// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  runtimeConfig: {
    public: {
      GMAP_API_KEY: process.env.GMAP_API_KEY || "AIzaSyCYsLDv3eHNGZ-HFcXUjoA5r442Aj10ND0"
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
            "body { margin: 0; padding: 0; min-height: 100dvh; min-height: -webkit-fill-available; overflow: hidden; position: fixed; top: 0; left: 0; right: 0;}",
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
