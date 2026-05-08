<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const route = useRoute()
const { page } = useData()

const expanded = ref(new Set())

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[^\w\u4e00-\u9fa5\- ]+/g, '')
    .replace(/\s+/g, '-')
}

function buildTree(headers = []) {
  const h2s = []
  let current = null

  for (const h of headers) {
    if (h.level === 2) {
      current = { ...h, children: [] }
      h2s.push(current)
    } else if (h.level === 3 && current) {
      current.children.push({ ...h })
    }
  }

  return h2s
}

const items = computed(() => buildTree(page.value.headers || []))

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
  expanded.value = new Set()
}

watch(() => route.path, initExpanded)
onMounted(initExpanded)
</script>

<template>
  <aside v-if="items.length" class="custom-outline">
    <div class="custom-outline-title">On this page</div>

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