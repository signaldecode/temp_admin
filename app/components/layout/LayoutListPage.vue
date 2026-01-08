<script setup>
/**
 * Layout List Page
 * 리스트 페이지 공통 레이아웃
 * - 고정: 타이틀, 필터, 벌크액션바, 페이지네이션
 * - 스크롤: 테이블/리스트 영역
 */
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">{{ title }}</h1>
        <p v-if="description || $slots.description" class="mt-1 text-neutral-600">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Filters -->
    <div v-if="$slots.filters" class="mb-4 shrink-0">
      <slot name="filters" />
    </div>

    <!-- Bulk Action Bar -->
    <div v-if="$slots.bulk" class="shrink-0">
      <slot name="bulk" />
    </div>

    <!-- Main Content (Scrollable) -->
    <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
      <slot />
    </div>

    <!-- Pagination -->
    <div v-if="$slots.pagination" class="mt-4 shrink-0">
      <slot name="pagination" />
    </div>
  </div>
</template>
