import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'SJ 的笔记站',
  description: '个人笔记网站',
  lang: 'zh-CN',

  // 如果你的仓库名是 my-notes，且发布到 GitHub Pages 项目页：
  // 访问地址会是 https://你的用户名.github.io/my-notes/
  // 这里必须写 /my-notes/
  base: '/my-notes/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记', link: '/notes/first-note' }
    ],
    sidebar: [
      {
        text: '笔记',
        items: [
          { text: '第一篇笔记', link: '/notes/first-note' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bsj-666/my-notes' }
    ]
  }
})