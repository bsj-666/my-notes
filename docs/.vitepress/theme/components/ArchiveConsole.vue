<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as siteData } from '../../../posts.data.mjs'

const activeTag = ref('全部')

const posts = computed(() => siteData?.posts || [])
const tags = computed(() => ['全部', ...new Set(posts.value.flatMap((post) => post.tags))])
const metrics = computed(() => siteData?.metrics || { total: 0, tagCount: 0, latestDate: '待补充' })

const filteredPosts = computed(() => {
  if (activeTag.value === '全部') {
    return posts.value
  }

  return posts.value.filter((post) => post.tags.includes(activeTag.value))
})

const archiveMetrics = computed(() => [
  { label: '笔记总数', value: String(metrics.value.total).padStart(2, '0') },
  { label: '主题标签', value: String(metrics.value.tagCount).padStart(2, '0') },
  { label: '最近更新', value: metrics.value.latestDate }
])
</script>

<template>
  <div class="archive-console">
    <section class="archive-overview">
      <div class="console-panel console-panel--archive-hero">
        <div class="console-eyebrow">ARCHIVE LEDGER</div>
        <h1 class="console-title">文章归档</h1>
        <p class="console-description">
          这里集中展示所有笔记条目，按“编号 / 标题 / 摘要 / 标签 / 更新时间”组织，便于快速检索和继续写作。
        </p>
      </div>

      <div class="console-panel console-panel--stats archive-console__stats">
        <div class="console-panel-title">ARCHIVE STATUS</div>
        <div class="console-metrics">
          <div v-for="item in archiveMetrics" :key="item.label" class="console-metric">
            <div class="console-metric__label">{{ item.label }}</div>
            <div class="console-metric__value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </section>

    <div class="console-tags console-tags--archive">
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

    <div class="archive-grid archive-grid--full">
      <article v-for="post in filteredPosts" :key="post.url" class="archive-card">
        <a class="archive-card__link" :href="withBase(post.url)">
          <div class="archive-card__meta">
            <span class="archive-card__id">{{ post.archiveId }}</span>
            <span class="archive-card__status">$ OPEN</span>
          </div>

          <h2 class="archive-card__title">{{ post.title }}</h2>
          <p class="archive-card__summary">{{ post.summary }}</p>

          <div class="archive-card__tags">
            <span v-for="tag in post.tags" :key="tag" class="archive-card__tag">{{ tag }}</span>
          </div>

          <div class="archive-card__footer">
            <span>更新于 {{ post.dateText || '待补充日期' }}</span>
            <span>OPEN LOG ↗</span>
          </div>
        </a>
      </article>
    </div>

    <div v-if="!filteredPosts.length" class="archive-empty">
      当前筛选条件下还没有匹配条目。
    </div>
  </div>
</template>
