import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { sidebar } from './sidebar.mjs'

export default withMermaid(
  defineConfig({
    title: 'SJ 的笔记站',
    description: '深空档案风格的个人笔记网站',
    lang: 'zh-CN',
    base: '/my-notes/',

    themeConfig: {
      nav: [
        { text: '首页', link: '/' },
        { text: '归档', link: '/archive' },
        { text: '关于', link: '/about' }
      ],
      sidebar,
      aside: 'right',
      outline: {
        label: '章节导航',
        level: [2, 3]
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/bsj-666/my-notes' }
      ],
      docFooter: {
        prev: '上一篇',
        next: '下一篇'
      }
    }
  })
)
