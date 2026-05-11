<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const progress = ref(0)
const showBackTop = ref(false)

const nonDocPaths = new Set(['/', '/archive', '/archive.html', '/about', '/about.html'])
const isDocPage = computed(() => !nonDocPaths.has(route.path))

function updateProgress() {
  const doc = document.querySelector('.VPDoc')
  if (!doc) {
    progress.value = 0
    showBackTop.value = false
    return
  }

  const content = doc.querySelector('.vp-doc')
  const rect = content?.getBoundingClientRect()
  const scrollTop = window.scrollY
  const totalHeight = (content?.offsetHeight || 0) - window.innerHeight

  if (rect && totalHeight > 0) {
    const start = rect.top + scrollTop
    const ratio = ((scrollTop - start) / totalHeight) * 100
    progress.value = Math.max(0, Math.min(100, ratio))
  } else {
    progress.value = 0
  }

  showBackTop.value = scrollTop > 360
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function copyHeadingLink(event) {
  const button = event.currentTarget
  const url = button?.dataset?.url
  if (!url) return

  await navigator.clipboard.writeText(url)
  button.dataset.copied = 'true'
  button.textContent = '已复制'

  window.setTimeout(() => {
    button.dataset.copied = 'false'
    button.textContent = '#'
  }, 1200)
}

function mountHeadingCopyButtons() {
  document.querySelectorAll('.heading-copy-button').forEach((button) => button.remove())

  const headings = document.querySelectorAll('.vp-doc h2[id], .vp-doc h3[id]')
  headings.forEach((heading) => {
    if (heading.querySelector('.heading-copy-button')) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'heading-copy-button'
    button.textContent = '#'
    button.dataset.copied = 'false'
    button.dataset.url = `${window.location.origin}${window.location.pathname}${window.location.search}#${heading.id}`
    button.addEventListener('click', copyHeadingLink)
    heading.appendChild(button)
  })
}

function refreshEnhance() {
  nextTick(() => {
    updateProgress()
    if (isDocPage.value) {
      mountHeadingCopyButtons()
    }
  })
}

onMounted(() => {
  refreshEnhance()
  window.addEventListener('scroll', updateProgress, { passive: true })
  window.addEventListener('resize', updateProgress)
})

watch(() => route.path, () => {
  refreshEnhance()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
  window.removeEventListener('resize', updateProgress)
})
</script>

<template>
  <div class="theme-enhance">
    <div v-if="isDocPage" class="reading-progress" :style="{ width: `${progress}%` }" />

    <button
      v-show="showBackTop"
      type="button"
      class="back-to-top"
      @click="scrollToTop"
    >
      ↑ TOP
    </button>
  </div>
</template>
