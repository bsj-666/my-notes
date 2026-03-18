import fs from 'fs'
import path from 'path'

const docsDir = path.resolve('docs')
const notesDir = path.join(docsDir, 'notes')
const vitepressDir = path.join(docsDir, '.vitepress')
const outputFile = path.join(vitepressDir, 'sidebar.mjs')

function getTitleFromMarkdown(filePath, fallback) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function generateSidebar() {
  ensureDir(vitepressDir)

  if (!fs.existsSync(notesDir)) {
    const content = `export const sidebar = [
  {
    text: '笔记',
    items: []
  }
]
`
    fs.writeFileSync(outputFile, content, 'utf-8')
    console.log('docs/notes 不存在，已生成空侧边栏。')
    return
  }

  const files = fs
    .readdirSync(notesDir)
    .filter(file => file.endsWith('.md'))
    .sort()

  const items = files.map(file => {
    const fullPath = path.join(notesDir, file)
    const name = file.replace(/\.md$/, '')
    const title = getTitleFromMarkdown(fullPath, name)

    return {
      text: title,
      link: `/notes/${name}`
    }
  })

  const content = `export const sidebar = [
  {
    text: '笔记',
    items: ${JSON.stringify(items, null, 4)}
  }
]
`

  fs.writeFileSync(outputFile, content, 'utf-8')
  console.log(`已生成侧边栏: ${outputFile}`)
}

generateSidebar()