<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as siteData } from '../../../posts.data.mjs'

const activeTag = ref('全部')

const posts = computed(() => siteData.value?.posts || [])
const metrics = computed(() => siteData.value?.metrics || { total: 0, tagCount: 0, latestDate: '待补充' })

const tags = computed(() => ['全部', ...new Set(posts.value.flatMap((post) => post.tags))])

const filteredPosts = computed(() => {
  if (activeTag.value === '全部') {
    return posts.value.slice(0, 6)
  }

  return posts.value.filter((post) => post.tags.includes(activeTag.value)).slice(0, 6)
})

const heroMetrics = computed(() => [
  { label: '档案总数', value: String(metrics.value.total).padStart(2, '0') },
  { label: '主题标签', value: String(metrics.value.tagCount).padStart(2, '0') },
  { label: '最近更新', value: metrics.value.latestDate }
])
</script>

<template>
  <div class="home-console">
    <section class="console-hero">
      <div class="console-panel console-panel--hero">
        <div class="console-eyebrow">STATION-01 / PERSONAL NOTES</div>
        <h1 class="console-title">我的笔记档案库</h1>
        <p class="console-description">
          这里收录开发、运维、工具链与项目过程中的有效记录，保持可追溯、可复用、可持续扩展。
        </p>

        <div class="console-status-row">
          <span class="console-chip console-chip--accent">ONLINE</span>
          <span class="console-chip">阅读优先</span>
          <span class="console-chip">持续归档中</span>
        </div>

        <div class="console-action-row">
          <a class="console-button" :href="withBase('/archive')">OPEN ARCHIVE</a>
          <a class="console-button console-button--ghost" :href="withBase('/about')">ABOUT STATION</a>
        </div>
      </div>

      <div class="console-panel console-panel--stats">
        <div class="console-panel-title">LIVE METRICS</div>
        <div class="console-metrics">
          <div v-for="item in heroMetrics" :key="item.label" class="console-metric">
            <div class="console-metric__label">{{ item.label }}</div>
            <div class="console-metric__value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="console-section">
      <div class="console-section__header">
        <div>
          <div class="console-eyebrow">RECENT LOGS</div>
          <h2>最近更新</h2>
        </div>
      </div>

      <div class="console-tags">
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          class="console-tag"
          :class="{ 'is-active': activeTag === tag }"
          @click="activeTag = tag"
        >
          {{ tag }}
        </button>
      </div>

      <div class="archive-grid">
        <article v-for="post in filteredPosts" :key="post.url" class="archive-card">
          <a class="archive-card__link" :href="withBase(post.url)">
            <div class="archive-card__meta">
              <span class="archive-card__id">{{ post.archiveId }}</span>
              <span class="archive-card__status">$ OPEN</span>
            </div>

            <h3 class="archive-card__title">{{ post.title }}</h3>
            <p class="archive-card__summary">{{ post.summary }}</p>

            <div class="archive-card__tags">
              <span v-for="tag in post.tags" :key="tag" class="archive-card__tag">{{ tag }}</span>
            </div>

            <div class="archive-card__footer">
              <span>{{ post.dateText || '待补充日期' }}</span>
              <span>OPEN LOG ↗</span>
            </div>
          </a>
        </article>
      </div>
    </section>
  </div>
</template>
