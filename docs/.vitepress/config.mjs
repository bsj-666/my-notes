import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { sidebar } from './sidebar.mjs'

export default withMermaid(
  defineConfig({
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
        { icon: 'github', link: 'https://github.com/bsj-666/my-notes' }
      ]
    }
  })
)