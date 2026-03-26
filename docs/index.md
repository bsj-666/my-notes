<script setup>
import { data as recentPosts } from './recent.data.mjs'
</script>

# 我的笔记站

欢迎来到我的个人笔记网站。

## 最近更新

<ul>
  <li v-for="post in recentPosts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span v-if="post.date"> - {{ post.date }}</span>
  </li>
</ul>

