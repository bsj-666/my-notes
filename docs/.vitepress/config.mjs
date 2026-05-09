import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar.mjs'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default defineConfig({
  title: 'SJ 的笔记站',
  description: '个人笔记网站',
  lang: 'zh-CN',
  base: '/my-notes/',
	
  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],
	
	sidebar,
	
	aside: 'right',
	outline: {
    label: '目录',
    level: [2, 3]
	},

    socialLinks: [
      { icon: 'github', link: 'https://bsj-666.github.io/my-notes' }
    ]
  }
})