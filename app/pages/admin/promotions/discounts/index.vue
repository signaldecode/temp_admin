<script setup>
/**
 * 할인 관리 목록 페이지
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

// 할인 종류 옵션
const discountTypeOptions = [
  { value: 'percent', label: '%' },
  { value: 'amount', label: '원' },
]

// 카테고리 옵션
const categoryOptions = [
  { value: 'outer', label: '아우터' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'shoes', label: '신발' },
  { value: 'acc', label: '액세서리' },
]

// 상태 옵션
const statusOptions = [
  { value: 'active', label: '진행중', color: 'success' },
  { value: 'scheduled', label: '예약', color: 'info' },
  { value: 'ended', label: '종료', color: 'neutral' },
  { value: 'inactive', label: '비활성', color: 'warning' },
]

// Mock 데이터
const discounts = ref([
  { id: 1, name: '신년 세일', type: 'percent', value: 20, targetCategories: null, startDate: '2025-01-01', endDate: '2025-01-31', status: 'active' },
  { id: 2, name: '아우터 특가', type: 'percent', value: 30, targetCategories: ['outer'], startDate: '2025-01-10', endDate: '2025-01-20', status: 'active' },
  { id: 3, name: '상시 할인', type: 'amount', value: 5000, targetCategories: null, startDate: '2025-01-01', endDate: null, status: 'active' },
  { id: 4, name: '봄 시즌 할인', type: 'percent', value: 15, targetCategories: ['top', 'bottom'], startDate: '2025-03-01', endDate: '2025-03-31', status: 'scheduled' },
  { id: 5, name: '연말 특가', type: 'percent', value: 50, targetCategories: null, startDate: '2024-12-20', endDate: '2024-12-31', status: 'ended' },
])

// 필터
const filterStatus = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

// 필터링된 목록
const filteredList = computed(() => {
  let result = [...discounts.value]
  if (filterStatus.value) result = result.filter((d) => d.status === filterStatus.value)
  if (filterCategory.value) {
    result = result.filter((d) => d.targetCategories?.includes(filterCategory.value))
  }
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((d) => d.name.toLowerCase().includes(keyword))
  }
  return result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
})

// 테이블 컬럼
const tableColumns = [
  { key: 'name', label: '할인명' },
  { key: 'discount', label: '할인' },
  { key: 'target', label: '적용 대상' },
  { key: 'period', label: '기간' },
  { key: 'status', label: '상태', width: 'w-24' },
]

// 선택
const selectedIds = ref([])
const handleSelectAll = (selectAll) => { selectedIds.value = selectAll ? paginatedList.value.map((d) => d.id) : [] }
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

// 벌크 삭제
const bulkDelete = () => {
  if (!selectedIds.value.length || !confirm(`선택한 ${selectedIds.value.length}개를 삭제하시겠습니까?`)) return
  discounts.value = discounts.value.filter((d) => !selectedIds.value.includes(d.id))
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
}

// 벌크 상태 변경
const bulkStatusChange = (newStatus) => {
  if (!selectedIds.value.length) return
  discounts.value = discounts.value.map((d) =>
    selectedIds.value.includes(d.id) ? { ...d, status: newStatus } : d
  )
  selectedIds.value = []
  const statusLabel = statusOptions.find((s) => s.value === newStatus)?.label || newStatus
  uiStore.showToast({ type: 'success', message: `상태가 "${statusLabel}"(으)로 변경되었습니다.` })
}

// 헬퍼 함수
const getStatusBadge = (status) => statusOptions.find((s) => s.value === status) || statusOptions[3]
const getCategoryLabel = (value) => categoryOptions.find((c) => c.value === value)?.label || value
const getTargetLabel = (targetCategories) => {
  if (!targetCategories || targetCategories.length === 0) return '전체'
  if (targetCategories.length === 1) return getCategoryLabel(targetCategories[0])
  return `${getCategoryLabel(targetCategories[0])} 외 ${targetCategories.length - 1}개`
}
const formatDiscount = (type, value) => type === 'percent' ? `${value}%` : `${value.toLocaleString()}원`
const formatPeriod = (start, end) => {
  const startStr = start ? new Date(start).toLocaleDateString('ko-KR') : ''
  const endStr = end ? new Date(end).toLocaleDateString('ko-KR') : '종료일 없음'
  return `${startStr} ~ ${endStr}`
}

// 페이지 이동
const goToCreate = () => router.push('/admin/promotions/discounts/new')
const goToDetail = (discount) => router.push(`/admin/promotions/discounts/${discount.id}`)

// 검색
const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterStatus.value = ''
  filterCategory.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredList.value.length / perPage))
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredList.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="할인 관리" description="카테고리별 또는 전체 할인을 관리합니다.">
    <template #actions>
      <UiButton variant="primary" @click="goToCreate">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        할인 등록
      </UiButton>
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
          <input v-model="searchKeyword" type="text" placeholder="할인명 검색" class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @keyup.enter="handleSearch">
        </template>
      </DomainFilterCard>
    </template>

    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="outline" size="sm" @click="bulkStatusChange('active')">활성화</UiButton>
        <UiButton variant="outline" size="sm" @click="bulkStatusChange('inactive')">비활성화</UiButton>
        <UiButton variant="danger" size="sm" @click="bulkDelete">삭제</UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- 안내 툴팁 -->
    <div class="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-primary-800">
          <p class="font-medium mb-1">할인 적용 안내</p>
          <p class="text-primary-700">상품 별 할인을 원하시면 <strong>상품 수정</strong>에서 할인을 등록하시고, 카테고리 별 또는 전체 할인을 원하실 땐 여기서 등록하세요. 여기서 등록하는 할인이 우선 적용됩니다.</p>
        </div>
      </div>
    </div>

    <DomainDataTable :columns="tableColumns" :items="paginatedList" :selected-ids="selectedIds" selectable empty-title="등록된 할인이 없습니다" @select="handleSelect" @select-all="handleSelectAll" @row-click="goToDetail">
      <template #cell-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ item.name }}</span>
      </template>
      <template #cell-discount="{ item }">
        <span class="text-sm font-semibold text-primary-600">{{ formatDiscount(item.type, item.value) }}</span>
      </template>
      <template #cell-target="{ item }">
        <span class="text-sm text-neutral-600">{{ getTargetLabel(item.targetCategories) }}</span>
      </template>
      <template #cell-period="{ item }">
        <span class="text-sm text-neutral-500">{{ formatPeriod(item.startDate, item.endDate) }}</span>
      </template>
      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
      </template>
      <template #mobile-card="{ item }">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-neutral-900">{{ item.name }}</span>
          <UiBadge :variant="getStatusBadge(item.status).color" size="sm">{{ getStatusBadge(item.status).label }}</UiBadge>
        </div>
        <div class="flex items-center gap-3 text-sm mb-1">
          <span class="font-semibold text-primary-600">{{ formatDiscount(item.type, item.value) }}</span>
          <span class="text-neutral-400">|</span>
          <span class="text-neutral-600">{{ getTargetLabel(item.targetCategories) }}</span>
        </div>
        <p class="text-xs text-neutral-400">{{ formatPeriod(item.startDate, item.endDate) }}</p>
      </template>
    </DomainDataTable>

    <template #pagination>
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" :total-items="filteredList.length" :per-page="perPage" />
    </template>
  </LayoutListPage>
</template>
