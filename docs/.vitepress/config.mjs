import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar.mjs'

export default defineConfig({
  title: 'SJ 的笔记站',
  description: '个人笔记网站',
  lang: 'zh-CN',
  base: '/my-notes/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],
	outline: {
      level: [2]   // 👈 只显示 h2
    },
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://bsj-666.github.io/my-notes' }
    ]
  }
})
