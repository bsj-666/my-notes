<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { data as siteData } from '../../../posts.data.mjs'

const activeTag = ref('全部')

const posts = computed(() => siteData.value?.posts || [])
const tags = computed(() => ['全部', ...new Set(posts.value.flatMap((post) => post.tags))])

const filteredPosts = computed(() => {
  if (activeTag.value === '全部') {
    return posts.value
  }

  return posts.value.filter((post) => post.tags.includes(activeTag.value))
})
</script>

<template>
  <div class="archive-console">
    <section class="console-panel console-panel--archive-hero">
      <div class="console-eyebrow">ARCHIVE LEDGER</div>
      <h1 class="console-title">文章归档</h1>
      <p class="console-description">
        这里集中展示所有笔记条目，你可以按主题快速筛选，再进入正文深入阅读。
      </p>
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
            <span>{{ post.dateText || '待补充日期' }}</span>
            <span>OPEN LOG ↗</span>
          </div>
        </a>
      </article>
    </div>
  </div>
</template>
