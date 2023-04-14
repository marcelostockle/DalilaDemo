import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './assets/main.css'
import './registerServiceWorker'

// vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import VCalendar from 'v-calendar'
import 'v-calendar/dist/style.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  }
})

createApp(App)
  .use(router)
  .use(vuetify)
  .use(VCalendar)
  .mount('#app')