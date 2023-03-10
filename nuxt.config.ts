// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  runtimeConfig: {
    public: {
      GMAP_API_KEY: process.env.GMAP_API_KEY || "AIzaSyCYsLDv3eHNGZ-HFcXUjoA5r442Aj10ND0",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin",
      ICONS: [{
        title: "アイコン１",
        value: "/images/treasure1.png",
      }, 
      {
        title: "アイコン２",
        value: "/images/treasure2.png",
      },
      {
        title: "アイコン３",
        value: "/images/treasure3.png",
      },
      {
        title: "アイコン４",
        value: "/images/treasure4.png",
      },]
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
        { rel: 'apple-touch-icon', type: 'image/png', href: '/apple-touch-icon-180x180.png' },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css?family=M+PLUS+1p',
        },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Montserrat&display=swap',
        },
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
  modules: [],
};
