import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { sidebar } from './sidebar.mjs'

export default withMermaid(
  defineConfig({
    title: 'SJ 的笔记站',
    description: '浅色阅读风格的个人笔记网站',
    lang: 'zh-CN',
    base: '/my-notes/',
    mermaid: {
      mermaidConfig: {
        theme: 'default',
        themeVariables: {
          primaryColor: '#e8f5d6',
          primaryTextColor: '#1f2937',
          primaryBorderColor: '#8abf41',
          lineColor: '#475569',
          secondaryColor: '#eef6ff',
          tertiaryColor: '#f8fafc',
          background: '#ffffff',
          mainBkg: '#eef6ff',
          secondBkg: '#f5f8fc',
          tertiaryBkg: '#ffffff',
          clusterBkg: '#f8fbff',
          clusterBorder: '#bfd5ea',
          edgeLabelBackground: '#ffffff',
          fontFamily: '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
          fontSize: '16px'
        }
      }
    },

    themeConfig: {
      appearance: false,
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
