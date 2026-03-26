import { createContentLoader } from 'vitepress'

export default createContentLoader('notes/*.md', {
  transform(rawData) {
    return rawData
      .filter((page) => page.frontmatter?.title)
      .sort((a, b) => {
        return +new Date(b.frontmatter.date || 0) - +new Date(a.frontmatter.date || 0)
      })
      .slice(0, 10)
      .map((page) => ({
        title: page.frontmatter.title,
        url: page.url,
        date: page.frontmatter.date || ''
      }))
  }
})