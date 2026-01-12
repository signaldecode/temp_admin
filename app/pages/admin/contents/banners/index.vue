<script setup>
/**
 * 배너 목록 페이지
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

// 배너 위치 옵션
const positionOptions = [
  { value: 'main_top', label: '메인 상단' },
  { value: 'main_middle', label: '메인 중단' },
  { value: 'main_bottom', label: '메인 하단' },
  { value: 'category', label: '카테고리 페이지' },
  { value: 'product', label: '상품 상세' },
]

// 상태 옵션
const statusOptions = [
  { value: 'active', label: '노출중', color: 'success' },
  { value: 'scheduled', label: '예약', color: 'info' },
  { value: 'ended', label: '종료', color: 'neutral' },
  { value: 'inactive', label: '비활성', color: 'warning' },
]

// Mock 배너 데이터
const banners = ref([
  {
    id: 1,
    title: '신년 세일 배너',
    position: 'main_top',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    hasEndDate: true,
    order: 1,
    clickCount: 2450,
  },
  {
    id: 2,
    title: '겨울 신상품',
    position: 'main_top',
    status: 'active',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    hasEndDate: true,
    order: 2,
    clickCount: 1890,
  },
  {
    id: 3,
    title: '회원가입 이벤트',
    position: 'main_middle',
    status: 'active',
    startDate: '2025-01-01',
    endDate: null,
    hasEndDate: false,
    order: 1,
    clickCount: 560,
  },
  {
    id: 4,
    title: '앱 다운로드',
    position: 'main_bottom',
    status: 'active',
    startDate: '2024-01-01',
    endDate: null,
    hasEndDate: false,
    order: 1,
    clickCount: 890,
  },
  {
    id: 5,
    title: '설 연휴 기획전',
    position: 'main_top',
    status: 'scheduled',
    startDate: '2025-01-20',
    endDate: '2025-02-05',
    hasEndDate: true,
    order: 3,
    clickCount: 0,
  },
])

// 필터
const filterPosition = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

// 필터링된 배너
const filteredBanners = computed(() => {
  let result = [...banners.value]

  if (filterPosition.value) {
    result = result.filter((b) => b.position === filterPosition.value)
  }

  if (filterStatus.value) {
    result = result.filter((b) => b.status === filterStatus.value)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((b) => b.title.toLowerCase().includes(keyword))
  }

  return result.sort((a, b) => a.order - b.order)
})

// 테이블 컬럼
const tableColumns = [
  { key: 'order', label: '순서', width: 'w-12' },
  { key: 'info', label: '배너정보' },
  { key: 'position', label: '위치' },
  { key: 'period', label: '노출기간' },
  { key: 'clickCount', label: '클릭수' },
  { key: 'status', label: '상태' },
]

// 벌크 선택
const selectedIds = ref([])

const handleSelectAll = (selectAll) => {
  selectedIds.value = selectAll ? paginatedBanners.value.map((b) => b.id) : []
}

const handleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  index > -1 ? selectedIds.value.splice(index, 1) : selectedIds.value.push(id)
}

// 벌크 삭제
const bulkDelete = () => {
  if (selectedIds.value.length === 0) return
  if (!confirm(`선택한 ${selectedIds.value.length}개의 배너를 삭제하시겠습니까?`)) return

  banners.value = banners.value.filter((b) => !selectedIds.value.includes(b.id))
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '선택한 배너가 삭제되었습니다.' })
}

// 벌크 상태 변경
const bulkChangeStatus = (status) => {
  if (selectedIds.value.length === 0) return
  banners.value = banners.value.map((b) =>
    selectedIds.value.includes(b.id) ? { ...b, status } : b
  )
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '상태가 변경되었습니다.' })
}

// 헬퍼 함수
const getStatusBadge = (status) => statusOptions.find((s) => s.value === status) || statusOptions[3]
const getPositionLabel = (position) => positionOptions.find((p) => p.value === position)?.label || position
const formatDate = (date) => date ? new Date(date).toLocaleDateString('ko-KR') : '-'

// 페이지 이동
const goToCreate = () => router.push('/admin/contents/banners/new')
const goToDetail = (banner) => router.push(`/admin/contents/banners/${banner.id}`)

// 검색
const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterPosition.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredBanners.value.length / perPage))
const paginatedBanners = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredBanners.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="배너 관리" description="사이트 배너를 관리합니다.">
    <template #actions>
      <UiButton variant="primary" @click="goToCreate">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        배너 등록
      </UiButton>
    </template>

    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select v-model="filterPosition" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">위치 전체</option>
            <option v-for="opt in positionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <select v-model="filterStatus" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">상태 전체</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="제목으로 검색"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            @keyup.enter="handleSearch"
          >
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
      :items="paginatedBanners"
      :selected-ids="selectedIds"
      selectable
      empty-title="등록된 배너가 없습니다"
      empty-description="새 배너를 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="goToDetail"
    >
      <template #cell-order="{ item }">
        <span class="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">{{ item.order }}</span>
      </template>

      <template #cell-info="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-24 h-14 bg-neutral-100 rounded overflow-hidden flex-shrink-0 flex items-center justify-center text-neutral-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm font-medium text-neutral-900 truncate">{{ item.title }}</p>
        </div>
      </template>

      <template #cell-position="{ item }">
        <span class="text-sm text-neutral-600">{{ getPositionLabel(item.position) }}</span>
      </template>

      <template #cell-period="{ item }">
        <div class="text-sm text-neutral-600">
          <p>{{ formatDate(item.startDate) }}</p>
          <p class="text-xs text-neutral-400">~ {{ item.hasEndDate ? formatDate(item.endDate) : '종료일 없음' }}</p>
        </div>
      </template>

      <template #cell-clickCount="{ item }">
        <span class="text-sm text-neutral-600">{{ item.clickCount.toLocaleString() }}</span>
      </template>

      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
      </template>

      <template #mobile-card="{ item }">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-5 h-5 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">{{ item.order }}</span>
          <p class="text-sm font-medium text-neutral-900 truncate flex-1">{{ item.title }}</p>
          <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
        </div>
        <div class="flex items-center gap-4 text-xs text-neutral-400">
          <span>{{ getPositionLabel(item.position) }}</span>
          <span>{{ formatDate(item.startDate) }} ~</span>
        </div>
      </template>
    </DomainDataTable>

    <template #pagination>
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" :total-items="filteredBanners.length" :per-page="perPage" />
    </template>
  </LayoutListPage>
</template>
