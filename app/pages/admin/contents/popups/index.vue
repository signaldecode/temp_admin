<script setup>
/**
 * 팝업 목록 페이지
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

// 팝업 종류 옵션
const typeOptions = [
  { value: 'layer', label: '레이어 모달' },
  { value: 'fullscreen', label: '풀스크린' },
]

// 상태 옵션
const statusOptions = [
  { value: 'active', label: '노출중', color: 'success' },
  { value: 'scheduled', label: '예약', color: 'info' },
  { value: 'ended', label: '종료', color: 'neutral' },
  { value: 'inactive', label: '비활성', color: 'warning' },
]

// Mock 데이터
const popups = ref([
  { id: 1, title: '신년 이벤트 안내', type: 'layer', status: 'active', startDate: '2025-01-01', endDate: '2025-01-31', hasEndDate: true, viewCount: 1250, clickCount: 340 },
  { id: 2, title: '앱 업데이트 공지', type: 'fullscreen', status: 'active', startDate: '2025-01-05', endDate: '2025-01-15', hasEndDate: true, viewCount: 890, clickCount: 120 },
  { id: 3, title: '설 연휴 배송 안내', type: 'layer', status: 'scheduled', startDate: '2025-01-20', endDate: '2025-02-05', hasEndDate: true, viewCount: 0, clickCount: 0 },
  { id: 4, title: '상시 회원가입 혜택', type: 'layer', status: 'active', startDate: '2024-01-01', endDate: null, hasEndDate: false, viewCount: 5420, clickCount: 1890 },
])

// 필터
const filterType = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

// 필터링된 팝업
const filteredPopups = computed(() => {
  let result = [...popups.value]
  if (filterType.value) result = result.filter((p) => p.type === filterType.value)
  if (filterStatus.value) result = result.filter((p) => p.status === filterStatus.value)
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((p) => p.title.toLowerCase().includes(keyword))
  }
  return result
})

// 테이블 컬럼
const tableColumns = [
  { key: 'title', label: '팝업명' },
  { key: 'type', label: '종류' },
  { key: 'period', label: '노출기간' },
  { key: 'stats', label: '통계' },
  { key: 'status', label: '상태' },
]

// 벌크 선택
const selectedIds = ref([])
const handleSelectAll = (selectAll) => { selectedIds.value = selectAll ? paginatedPopups.value.map((p) => p.id) : [] }
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

// 벌크 액션
const bulkDelete = () => {
  if (!selectedIds.value.length || !confirm(`선택한 ${selectedIds.value.length}개의 팝업을 삭제하시겠습니까?`)) return
  popups.value = popups.value.filter((p) => !selectedIds.value.includes(p.id))
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
}

const bulkChangeStatus = (status) => {
  if (!selectedIds.value.length) return
  popups.value = popups.value.map((p) => selectedIds.value.includes(p.id) ? { ...p, status } : p)
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '상태가 변경되었습니다.' })
}

// 헬퍼
const getStatusBadge = (status) => statusOptions.find((s) => s.value === status) || statusOptions[3]
const getTypeLabel = (type) => typeOptions.find((t) => t.value === type)?.label || type
const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-'

// 페이지 이동
const goToCreate = () => router.push('/admin/contents/popups/new')
const goToDetail = (popup) => router.push(`/admin/contents/popups/${popup.id}`)

// 검색
const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterType.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredPopups.value.length / perPage))
const paginatedPopups = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPopups.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="팝업 관리" description="사이트 팝업을 관리합니다.">
    <template #actions>
      <UiButton variant="primary" @click="goToCreate">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        팝업 등록
      </UiButton>
    </template>

    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select v-model="filterType" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">종류 전체</option>
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
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
        <UiButton variant="outline" size="sm" @click="bulkChangeStatus('active')">노출</UiButton>
        <UiButton variant="outline" size="sm" @click="bulkChangeStatus('inactive')">비활성</UiButton>
        <UiButton variant="danger" size="sm" @click="bulkDelete">삭제</UiButton>
      </DomainBulkActionBar>
    </template>

    <DomainDataTable
      :columns="tableColumns"
      :items="paginatedPopups"
      :selected-ids="selectedIds"
      selectable
      empty-title="등록된 팝업이 없습니다"
      empty-description="새 팝업을 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="goToDetail"
    >
      <template #cell-title="{ item }">
        <p class="text-sm font-medium text-neutral-900">{{ item.title }}</p>
      </template>

      <template #cell-type="{ item }">
        <span class="text-sm text-neutral-600">{{ getTypeLabel(item.type) }}</span>
      </template>

      <template #cell-period="{ item }">
        <div class="text-sm text-neutral-600">
          <p>{{ formatDate(item.startDate) }}</p>
          <p class="text-xs text-neutral-400">~ {{ item.hasEndDate ? formatDate(item.endDate) : '종료일 없음' }}</p>
        </div>
      </template>

      <template #cell-stats="{ item }">
        <div class="text-sm text-neutral-600">
          <p>노출 {{ item.viewCount.toLocaleString() }}</p>
          <p class="text-xs text-neutral-400">클릭 {{ item.clickCount.toLocaleString() }}</p>
        </div>
      </template>

      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
      </template>

      <template #mobile-card="{ item }">
        <div class="flex items-center justify-between mb-1">
          <p class="text-sm font-medium text-neutral-900 truncate flex-1">{{ item.title }}</p>
          <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
        </div>
        <div class="flex items-center gap-4 text-xs text-neutral-400">
          <span>{{ getTypeLabel(item.type) }}</span>
          <span>{{ formatDate(item.startDate) }} ~</span>
        </div>
      </template>
    </DomainDataTable>

    <template #pagination>
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" :total-items="filteredPopups.length" :per-page="perPage" />
    </template>
  </LayoutListPage>
</template>
