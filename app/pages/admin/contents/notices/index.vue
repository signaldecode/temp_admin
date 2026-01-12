<script setup>
/**
 * 공지사항 목록 페이지
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

const categoryOptions = [
  { value: 'general', label: '일반' },
  { value: 'event', label: '이벤트' },
  { value: 'system', label: '시스템' },
  { value: 'shipping', label: '배송' },
]

const statusOptions = [
  { value: 'published', label: '게시중', color: 'success' },
  { value: 'draft', label: '임시저장', color: 'warning' },
]

const notices = ref([
  { id: 1, title: '2025년 신년 운영 안내', category: 'general', status: 'published', isPinned: true, viewCount: 1520, createdAt: '2025-01-01' },
  { id: 2, title: '설 연휴 배송 안내', category: 'shipping', status: 'published', isPinned: true, viewCount: 890, createdAt: '2025-01-10' },
  { id: 3, title: '시스템 점검 안내', category: 'system', status: 'published', isPinned: false, viewCount: 450, createdAt: '2025-01-05' },
  { id: 4, title: '신규 이벤트 안내', category: 'event', status: 'draft', isPinned: false, viewCount: 0, createdAt: '2025-01-08' },
])

const filterCategory = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

const filteredNotices = computed(() => {
  let result = [...notices.value]
  if (filterCategory.value) result = result.filter((n) => n.category === filterCategory.value)
  if (filterStatus.value) result = result.filter((n) => n.status === filterStatus.value)
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((n) => n.title.toLowerCase().includes(keyword))
  }
  return result.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
})

const tableColumns = [
  { key: 'title', label: '제목' },
  { key: 'category', label: '분류' },
  { key: 'viewCount', label: '조회수' },
  { key: 'createdAt', label: '등록일' },
  { key: 'status', label: '상태' },
]

const selectedIds = ref([])
const handleSelectAll = (selectAll) => { selectedIds.value = selectAll ? paginatedNotices.value.map((n) => n.id) : [] }
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

const bulkDelete = () => {
  if (!selectedIds.value.length || !confirm(`선택한 ${selectedIds.value.length}개를 삭제하시겠습니까?`)) return
  notices.value = notices.value.filter((n) => !selectedIds.value.includes(n.id))
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
}

const getCategoryLabel = (category) => categoryOptions.find((c) => c.value === category)?.label || category
const getStatusBadge = (status) => statusOptions.find((s) => s.value === status) || statusOptions[1]
const formatDate = (date) => new Date(date).toLocaleDateString('ko-KR')

const goToCreate = () => router.push('/admin/contents/notices/new')
const goToDetail = (notice) => router.push(`/admin/contents/notices/${notice.id}`)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterCategory.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredNotices.value.length / perPage))
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredNotices.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="공지사항 관리" description="공지사항을 관리합니다.">
    <template #actions>
      <UiButton variant="primary" @click="goToCreate">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        공지 등록
      </UiButton>
    </template>

    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select v-model="filterCategory" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">분류 전체</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <select v-model="filterStatus" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">상태 전체</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </template>
        <template #search>
          <input v-model="searchKeyword" type="text" placeholder="제목으로 검색" class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @keyup.enter="handleSearch">
        </template>
      </DomainFilterCard>
    </template>

    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="danger" size="sm" @click="bulkDelete">삭제</UiButton>
      </DomainBulkActionBar>
    </template>

    <DomainDataTable :columns="tableColumns" :items="paginatedNotices" :selected-ids="selectedIds" selectable empty-title="등록된 공지사항이 없습니다" @select="handleSelect" @select-all="handleSelectAll" @row-click="goToDetail">
      <template #cell-title="{ item }">
        <div class="flex items-center gap-2">
          <span v-if="item.isPinned" class="text-primary-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2h2a1 1 0 010 2h-1.268l-.686 6.858A2 2 0 0113.06 18H6.94a2 2 0 01-1.986-1.858L4.268 9H3a1 1 0 010-2h2V5z" /></svg>
          </span>
          <p class="text-sm font-medium text-neutral-900">{{ item.title }}</p>
        </div>
      </template>
      <template #cell-category="{ item }"><span class="text-sm text-neutral-600">{{ getCategoryLabel(item.category) }}</span></template>
      <template #cell-viewCount="{ item }"><span class="text-sm text-neutral-600">{{ item.viewCount.toLocaleString() }}</span></template>
      <template #cell-createdAt="{ item }"><span class="text-sm text-neutral-600">{{ formatDate(item.createdAt) }}</span></template>
      <template #cell-status="{ item }"><UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge></template>
      <template #mobile-card="{ item }">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span v-if="item.isPinned" class="text-primary-500"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2h2a1 1 0 010 2h-1.268l-.686 6.858A2 2 0 0113.06 18H6.94a2 2 0 01-1.986-1.858L4.268 9H3a1 1 0 010-2h2V5z" /></svg></span>
            <p class="text-sm font-medium text-neutral-900 truncate">{{ item.title }}</p>
          </div>
          <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
        </div>
        <div class="flex items-center gap-4 text-xs text-neutral-400">
          <span>{{ getCategoryLabel(item.category) }}</span>
          <span>{{ formatDate(item.createdAt) }}</span>
          <span>조회 {{ item.viewCount }}</span>
        </div>
      </template>
    </DomainDataTable>

    <template #pagination>
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" :total-items="filteredNotices.length" :per-page="perPage" />
    </template>
  </LayoutListPage>
</template>
