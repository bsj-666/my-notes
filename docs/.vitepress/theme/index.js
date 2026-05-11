import DefaultTheme from 'vitepress/theme'
import { Fragment, h } from 'vue'
import CustomOutline from './components/CustomOutline.vue'
import ThemeEnhance from './components/ThemeEnhance.vue'
import './style.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(Fragment, [
      h(DefaultTheme.Layout, null, {
        'aside-outline-before': () => h(CustomOutline)
      }),
      h(ThemeEnhance)
    ])
  }
}
