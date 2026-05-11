import { createContentLoader } from 'vitepress'

function extractTitle(page) {
  if (page.frontmatter?.title) {
    return page.frontmatter.title
  }

  const match = page.src?.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || page.url.split('/').filter(Boolean).pop() || '未命名笔记'
}

function extractSummary(page) {
  if (page.frontmatter?.summary) {
    return page.frontmatter.summary
  }

  const lines = (page.src || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false
      if (line.startsWith('#')) return false
      if (line.startsWith('![')) return false
      if (line.startsWith('```')) return false
      if (line.startsWith('---')) return false
      return true
    })

  return (lines[0] || '持续整理中的个人笔记。').slice(0, 92)
}

function normalizeTags(page) {
  const tags = page.frontmatter?.tags
  if (Array.isArray(tags)) {
    return tags
  }

  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return ['笔记']
}

function formatDate(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export default createContentLoader('notes/*.md', {
  transform(rawData) {
    const posts = rawData
      .map((page, index) => {
        const title = extractTitle(page)
        const summary = extractSummary(page)
        const tags = normalizeTags(page)
        const date = page.frontmatter?.date || ''
        const order = index + 1

        return {
          title,
          url: page.url,
          summary,
          tags,
          date,
          dateText: formatDate(date),
          archiveId: `ARC-${String(order).padStart(2, '0')}`
        }
      })
      .sort((a, b) => {
        const left = a.date ? +new Date(a.date) : 0
        const right = b.date ? +new Date(b.date) : 0
        return right - left
      })
      .map((post, index) => ({
        ...post,
        archiveId: `ARC-${String(index + 1).padStart(2, '0')}`
      }))

    const tags = [...new Set(posts.flatMap((post) => post.tags))]
    const latestDate = posts.find((post) => post.date)?.dateText || '待补充'

    return {
      posts,
      metrics: {
        total: posts.length,
        tagCount: tags.length,
        latestDate
      }
    }
  }
})
