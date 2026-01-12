<script setup>
/**
 * Q&A 목록 페이지
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

const categoryOptions = [
  { value: 'product', label: '상품문의' },
  { value: 'delivery', label: '배송문의' },
  { value: 'exchange', label: '교환/반품' },
  { value: 'payment', label: '결제문의' },
  { value: 'etc', label: '기타' },
]

const statusOptions = [
  { value: 'pending', label: '답변대기', color: 'warning' },
  { value: 'answered', label: '답변완료', color: 'success' },
]

const qnaList = ref([
  { id: 1, category: 'product', title: '상품 사이즈 문의드립니다', author: '김철수', status: 'pending', isSecret: false, createdAt: '2025-01-06 14:30' },
  { id: 2, category: 'delivery', title: '배송 언제 되나요?', author: '이영희', status: 'answered', isSecret: true, createdAt: '2025-01-05 10:20' },
  { id: 3, category: 'exchange', title: '교환 신청합니다', author: '박민수', status: 'pending', isSecret: true, createdAt: '2025-01-06 09:15' },
  { id: 4, category: 'payment', title: '결제 오류 문의', author: '정수진', status: 'answered', isSecret: false, createdAt: '2025-01-04 16:00' },
  { id: 5, category: 'product', title: '재입고 언제 되나요?', author: '최동욱', status: 'pending', isSecret: false, createdAt: '2025-01-06 11:00' },
])

const filterStatus = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

const filteredList = computed(() => {
  let result = [...qnaList.value]
  if (filterStatus.value) result = result.filter((q) => q.status === filterStatus.value)
  if (filterCategory.value) result = result.filter((q) => q.category === filterCategory.value)
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((q) => q.title.toLowerCase().includes(keyword) || q.author.toLowerCase().includes(keyword))
  }
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const tableColumns = [
  { key: 'status', label: '상태', width: 'w-24' },
  { key: 'category', label: '카테고리', width: 'w-28' },
  { key: 'title', label: '제목' },
  { key: 'author', label: '작성자', width: 'w-24' },
  { key: 'createdAt', label: '작성일', width: 'w-36' },
]

const selectedIds = ref([])
const handleSelectAll = (selectAll) => { selectedIds.value = selectAll ? paginatedList.value.map((q) => q.id) : [] }
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

const bulkDelete = () => {
  if (!selectedIds.value.length || !confirm(`선택한 ${selectedIds.value.length}개를 삭제하시겠습니까?`)) return
  qnaList.value = qnaList.value.filter((q) => !selectedIds.value.includes(q.id))
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
}

const pendingCount = computed(() => qnaList.value.filter((q) => q.status === 'pending').length)
const getStatusBadge = (status) => statusOptions.find((s) => s.value === status) || statusOptions[0]
const getCategoryLabel = (category) => categoryOptions.find((c) => c.value === category)?.label || category

const goToDetail = (qna) => router.push(`/admin/contents/qna/${qna.id}`)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterStatus.value = ''
  filterCategory.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredList.value.length / perPage))
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredList.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="Q&A 관리">
    <template #description>
      고객 문의에 답변합니다.
      <span v-if="pendingCount > 0" class="text-warning-600 font-medium">(답변 대기 {{ pendingCount }}건)</span>
    </template>

    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select v-model="filterStatus" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">상태 전체</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <select v-model="filterCategory" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">카테고리 전체</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </template>
        <template #search>
          <input v-model="searchKeyword" type="text" placeholder="제목, 작성자 검색" class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @keyup.enter="handleSearch">
        </template>
      </DomainFilterCard>
    </template>

    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="danger" size="sm" @click="bulkDelete">삭제</UiButton>
      </DomainBulkActionBar>
    </template>

    <DomainDataTable :columns="tableColumns" :items="paginatedList" :selected-ids="selectedIds" selectable empty-title="문의가 없습니다" @select="handleSelect" @select-all="handleSelectAll" @row-click="goToDetail">
      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
      </template>
      <template #cell-category="{ item }">
        <span class="text-sm text-neutral-600">{{ getCategoryLabel(item.category) }}</span>
      </template>
      <template #cell-title="{ item }">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-neutral-900 truncate">{{ item.title }}</span>
          <svg v-if="item.isSecret" class="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </template>
      <template #cell-author="{ item }">
        <span class="text-sm text-neutral-600">{{ item.author }}</span>
      </template>
      <template #cell-createdAt="{ item }">
        <span class="text-sm text-neutral-500">{{ item.createdAt }}</span>
      </template>
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
            <span class="text-xs text-neutral-500">{{ getCategoryLabel(item.category) }}</span>
          </div>
          <svg v-if="item.isSecret" class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-neutral-900 mb-1 truncate">{{ item.title }}</p>
        <div class="flex items-center gap-3 text-xs text-neutral-400">
          <span>{{ item.author }}</span>
          <span>{{ item.createdAt }}</span>
        </div>
      </template>
    </DomainDataTable>

    <template #pagination>
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" :total-items="filteredList.length" :per-page="perPage" />
    </template>
  </LayoutListPage>
</template>
