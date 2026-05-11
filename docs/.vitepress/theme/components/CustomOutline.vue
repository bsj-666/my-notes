<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const expanded = ref(new Set())
const items = ref([])

function buildTreeFromDom() {
  const headings = Array.from(document.querySelectorAll('.vp-doc h2[id], .vp-doc h3[id]'))
    .map((node) => ({
      level: Number(node.tagName.replace('H', '')),
      title: node.childNodes[0]?.textContent?.trim() || node.textContent.trim().replace(/\s*#\s*$/, ''),
      link: `#${node.id}`
    }))

  const h2s = []
  let current = null

  for (const heading of headings) {
    if (heading.level === 2) {
      current = { ...heading, children: [] }
      h2s.push(current)
    } else if (heading.level === 3 && current) {
      current.children.push({ ...heading })
    }
  }

  items.value = h2s
}

function toggle(link) {
  const next = new Set(expanded.value)
  if (next.has(link)) {
    next.delete(link)
  } else {
    next.add(link)
  }
  expanded.value = next
}

function isOpen(link) {
  return expanded.value.has(link)
}

function initExpanded() {
  expanded.value = new Set(items.value.map((item) => item.link))
}

function refreshOutline() {
  nextTick(() => {
    buildTreeFromDom()
    initExpanded()
  })
}

watch(() => route.path, refreshOutline)
onMounted(refreshOutline)
</script>

<template>
  <aside v-if="items.length" class="custom-outline">
    <div class="custom-outline-title">章节导航</div>

    <div
      v-for="item in items"
      :key="item.link"
      class="custom-outline-group"
    >
      <button
        class="custom-outline-toggle"
        type="button"
        @click="toggle(item.link)"
      >
        <span>{{ isOpen(item.link) ? '▾' : '▸' }}</span>
        <a :href="item.link" @click.stop>{{ item.title }}</a>
      </button>

      <div v-show="isOpen(item.link)" class="custom-outline-children">
        <a
          v-for="child in item.children"
          :key="child.link"
          class="custom-outline-link level-3"
          :href="child.link"
        >
          {{ child.title }}
        </a>
      </div>
    </div>
  </aside>
</template>
