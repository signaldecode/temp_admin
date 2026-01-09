<script setup>
/**
 * 교환/반품/취소 페이지
 * - 교환요청, 반품요청, 취소 상태 주문만 표시
 * - 벌크 선택 + 상태 변경
 */

const router = useRouter()

// 검색 필터
const filterType = ref('')      // 유형 필터 (교환/반품/취소)
const filterStatus = ref('')    // 상태 필터 (요청/승인/완료 등)
const searchType = ref('orderNo')
const searchKeyword = ref('')

const searchOptions = [
  { value: 'orderNo', label: '주문번호' },
  { value: 'userId', label: '유저ID' },
  { value: 'phone', label: '연락처' },
]

// 유형에 따른 상태 필터 옵션
const statusFilterOptions = computed(() => {
  if (filterType.value === 'exchange') {
    return [
      { value: 'exchange_requested', label: '교환요청' },
      { value: 'exchange_approved', label: '교환승인' },
      { value: 'exchange_completed', label: '교환완료' },
    ]
  }
  if (filterType.value === 'return') {
    return [
      { value: 'return_requested', label: '반품요청' },
      { value: 'return_approved', label: '반품승인' },
      { value: 'return_completed', label: '반품완료' },
    ]
  }
  if (filterType.value === 'cancel') {
    return [
      { value: 'cancelled', label: '취소' },
    ]
  }
  // 전체일 경우 모든 상태
  return [
    { value: 'exchange_requested', label: '교환요청' },
    { value: 'exchange_approved', label: '교환승인' },
    { value: 'exchange_completed', label: '교환완료' },
    { value: 'return_requested', label: '반품요청' },
    { value: 'return_approved', label: '반품승인' },
    { value: 'return_completed', label: '반품완료' },
    { value: 'cancelled', label: '취소' },
  ]
})

// 유형 변경 시 상태 필터 초기화
watch(filterType, () => {
  filterStatus.value = ''
})

// 로딩 상태
const isLoading = ref(false)

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage))

// 주문 목록
const orders = ref([])

// 벌크 선택
const selectedIds = ref([])

// 상태 변경 모달
const showStatusModal = ref(false)
const selectedStatus = ref('')

// 클레임 상태 옵션 (교환/반품/취소만)
const claimStatusOptions = [
  { value: 'exchange_requested', label: '교환요청' },
  { value: 'exchange_approved', label: '교환승인' },
  { value: 'exchange_completed', label: '교환완료' },
  { value: 'return_requested', label: '반품요청' },
  { value: 'return_approved', label: '반품승인' },
  { value: 'return_completed', label: '반품완료' },
  { value: 'cancelled', label: '취소' },
]

// 클레임 상태 매핑
const statusMap = {
  exchange_requested: { label: '교환요청', variant: 'warning' },
  exchange_approved: { label: '교환승인', variant: 'info' },
  exchange_completed: { label: '교환완료', variant: 'success' },
  return_requested: { label: '반품요청', variant: 'warning' },
  return_approved: { label: '반품승인', variant: 'info' },
  return_completed: { label: '반품완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'error' },
}

// 클레임 유형 필터 옵션
const claimTypeOptions = [
  { value: 'exchange', label: '교환' },
  { value: 'return', label: '반품' },
  { value: 'cancel', label: '취소' },
]

// Mock 데이터 로드
const fetchOrders = async () => {
  isLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 300))

  // 클레임 상태인 주문만 (교환/반품/취소)
  const allClaimOrders = [
    { id: 1, orderNo: 'ORD20250108001', orderDate: '2025-01-08 14:30', userId: 'user001', userName: '김철수', phone: '010-1234-5678', reason: '사이즈 교환', itemCount: 1, totalAmount: 89000, status: 'exchange_requested', claimDate: '2025-01-09 10:30' },
    { id: 2, orderNo: 'ORD20250107002', orderDate: '2025-01-07 11:20', userId: 'user002', userName: '이영희', phone: '010-2345-6789', reason: '상품 불량', itemCount: 2, totalAmount: 156000, status: 'return_requested', claimDate: '2025-01-08 15:20' },
    { id: 3, orderNo: 'ORD20250107003', orderDate: '2025-01-07 09:45', userId: 'user003', userName: '박민수', phone: '010-3456-7890', reason: '단순 변심', itemCount: 1, totalAmount: 45000, status: 'cancelled', claimDate: '2025-01-07 12:00' },
    { id: 4, orderNo: 'ORD20250106001', orderDate: '2025-01-06 16:30', userId: 'user004', userName: '정수진', phone: '010-4567-8901', reason: '색상 교환', itemCount: 1, totalAmount: 78000, status: 'exchange_approved', claimDate: '2025-01-07 09:00' },
    { id: 5, orderNo: 'ORD20250106002', orderDate: '2025-01-06 14:00', userId: 'user005', userName: '최동욱', phone: '010-5678-9012', reason: '오배송', itemCount: 3, totalAmount: 234000, status: 'return_approved', claimDate: '2025-01-07 11:30' },
    { id: 6, orderNo: 'ORD20250105001', orderDate: '2025-01-05 10:15', userId: 'user006', userName: '강미영', phone: '010-6789-0123', reason: '단순 변심', itemCount: 1, totalAmount: 67000, status: 'cancelled', claimDate: '2025-01-05 14:00' },
    { id: 7, orderNo: 'ORD20250104001', orderDate: '2025-01-04 13:45', userId: 'user007', userName: '윤서준', phone: '010-7890-1234', reason: '사이즈 교환', itemCount: 2, totalAmount: 128000, status: 'exchange_completed', claimDate: '2025-01-05 16:00' },
    { id: 8, orderNo: 'ORD20250104002', orderDate: '2025-01-04 11:30', userId: 'user008', userName: '임지현', phone: '010-8901-2345', reason: '상품 파손', itemCount: 1, totalAmount: 189000, status: 'return_completed', claimDate: '2025-01-06 10:00' },
    // 더미 데이터
    ...Array.from({ length: 42 }, (_, i) => ({
      id: 9 + i,
      orderNo: `ORD20250${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}${String(100 + i).padStart(3, '0')}`,
      orderDate: `2025-01-0${Math.floor(Math.random() * 8) + 1} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      userId: `user${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      userName: `테스트 회원 ${9 + i}`,
      phone: `010-${String(1000 + i).slice(-4)}-${String(5000 + i).slice(-4)}`,
      reason: ['사이즈 교환', '색상 교환', '단순 변심', '상품 불량', '오배송', '상품 파손'][Math.floor(Math.random() * 6)],
      itemCount: Math.floor(Math.random() * 3) + 1,
      totalAmount: Math.floor(Math.random() * 300000) + 30000,
      status: ['exchange_requested', 'exchange_approved', 'return_requested', 'return_approved', 'cancelled'][Math.floor(Math.random() * 5)],
      claimDate: `2025-01-0${Math.floor(Math.random() * 8) + 1} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    })),
  ]

  // 유형 필터링
  let filtered = allClaimOrders
  if (filterType.value) {
    if (filterType.value === 'exchange') {
      filtered = filtered.filter((order) => order.status.startsWith('exchange'))
    } else if (filterType.value === 'return') {
      filtered = filtered.filter((order) => order.status.startsWith('return'))
    } else if (filterType.value === 'cancel') {
      filtered = filtered.filter((order) => order.status === 'cancelled')
    }
  }

  // 상태 필터링
  if (filterStatus.value) {
    filtered = filtered.filter((order) => order.status === filterStatus.value)
  }

  // 검색 필터링
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter((order) => {
      switch (searchType.value) {
        case 'orderNo':
          return order.orderNo.toLowerCase().includes(keyword)
        case 'userId':
          return order.userId.toLowerCase().includes(keyword)
        case 'phone':
          return order.phone.replace(/-/g, '').includes(keyword.replace(/-/g, ''))
        default:
          return true
      }
    })
  }

  totalItems.value = filtered.length

  // 페이지네이션
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  orders.value = filtered.slice(start, end)

  // 페이지 변경 시 선택 초기화
  selectedIds.value = []

  isLoading.value = false
}

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 검색 초기화
const handleReset = () => {
  filterType.value = ''
  filterStatus.value = ''
  searchType.value = 'orderNo'
  searchKeyword.value = ''
  currentPage.value = 1
  fetchOrders()
}

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'orderNo', label: '주문번호' },
  { key: 'claimDate', label: '접수일시' },
  { key: 'userId', label: '유저ID' },
  { key: 'phone', label: '연락처' },
  { key: 'reason', label: '사유' },
  { key: 'itemCount', label: '건수', align: 'center' },
  { key: 'totalAmount', label: '주문금액', align: 'right' },
  { key: 'status', label: '상태', align: 'center' },
]

// 전체 선택/해제
const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = orders.value.map((o) => o.id)
  } else {
    selectedIds.value = []
  }
}

// 개별 선택
const handleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 상태 변경 모달 열기
const openStatusModal = () => {
  selectedStatus.value = ''
  showStatusModal.value = true
}

// 상태 변경 실행
const handleStatusChange = async () => {
  if (!selectedStatus.value) return

  // 실제로는 API 호출
  orders.value = orders.value.map((order) => {
    if (selectedIds.value.includes(order.id)) {
      return { ...order, status: selectedStatus.value }
    }
    return order
  })

  const changedCount = selectedIds.value.length
  showStatusModal.value = false
  selectedIds.value = []

  // 성공 알림
  const uiStore = useUiStore()
  uiStore.showToast({
    type: 'success',
    message: `${changedCount}건의 상태가 변경되었습니다.`,
  })
}

// 주문 상세로 이동
const goToDetail = (orderId) => {
  router.push(`/admin/orders/${orderId}`)
}

// 초기 로드
onMounted(() => {
  fetchOrders()
})

// import
import { useUiStore } from '~/stores/ui'
</script>

<template>
  <LayoutListPage title="교환/반품/취소">
    <!-- Description -->
    <template #description>
      전체 {{ totalItems.toLocaleString() }}건
    </template>

    <!-- Filters -->
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <!-- 유형 필터 -->
          <select
            v-model="filterType"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">유형 전체</option>
            <option v-for="option in claimTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <!-- 상태 필터 -->
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">상태 전체</option>
            <option v-for="option in statusFilterOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <!-- 검색 유형 -->
          <select
            v-model="searchType"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option v-for="option in searchOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="`${searchOptions.find(o => o.value === searchType)?.label}(으)로 검색`"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <!-- Bulk Actions -->
    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="primary" size="sm" @click="openStatusModal">
          상태 변경
        </UiButton>
        <UiButton variant="ghost" size="sm" @click="selectedIds = []">
          선택 해제
        </UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-white rounded-lg border border-neutral-200">
      <UiSpinner size="lg" />
    </div>

    <!-- Order List -->
    <DomainDataTable
      v-else
      :columns="tableColumns"
      :items="orders"
      :selected-ids="selectedIds"
      selectable
      empty-title="검색 결과가 없습니다"
      empty-description="다른 검색어로 다시 시도해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="(order) => goToDetail(order.id)"
    >
      <!-- 주문번호 -->
      <template #cell-orderNo="{ item }">
        <span class="text-sm font-medium text-primary-600">{{ item.orderNo }}</span>
      </template>

      <!-- 접수일시 -->
      <template #cell-claimDate="{ item }">
        <span class="text-sm text-neutral-600">{{ item.claimDate }}</span>
      </template>

      <!-- 유저ID -->
      <template #cell-userId="{ item }">
        <span class="text-sm text-neutral-900">{{ item.userId }}</span>
      </template>

      <!-- 연락처 -->
      <template #cell-phone="{ item }">
        <span class="text-sm text-neutral-600">{{ item.phone }}</span>
      </template>

      <!-- 사유 -->
      <template #cell-reason="{ item }">
        <span class="text-sm text-neutral-700">{{ item.reason }}</span>
      </template>

      <!-- 건수 -->
      <template #cell-itemCount="{ item }">
        <span class="text-sm text-neutral-700">{{ item.itemCount }}건</span>
      </template>

      <!-- 주문금액 -->
      <template #cell-totalAmount="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ formatCurrency(item.totalAmount) }}</span>
      </template>

      <!-- 상태 -->
      <template #cell-status="{ item }">
        <UiBadge :variant="statusMap[item.status]?.variant || 'neutral'" size="sm">
          {{ statusMap[item.status]?.label || item.status }}
        </UiBadge>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-sm font-medium text-primary-600">{{ item.orderNo }}</span>
            <p class="text-xs text-neutral-500">{{ item.claimDate }}</p>
          </div>
          <UiBadge :variant="statusMap[item.status]?.variant || 'neutral'" size="sm">
            {{ statusMap[item.status]?.label || item.status }}
          </UiBadge>
        </div>
        <div class="text-sm text-neutral-600 space-y-1">
          <p>{{ item.userId }} ({{ item.userName }})</p>
          <p>{{ item.phone }}</p>
          <p class="text-neutral-500">사유: {{ item.reason }}</p>
        </div>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
          <span class="text-sm text-neutral-500">{{ item.itemCount }}건</span>
          <span class="text-sm font-semibold text-neutral-900">{{ formatCurrency(item.totalAmount) }}</span>
        </div>
      </template>

      <!-- Empty action -->
      <template #empty>
        <UiButton variant="outline" size="sm" @click="handleReset">
          검색 초기화
        </UiButton>
      </template>
    </DomainDataTable>

    <!-- Pagination -->
    <template #pagination>
      <UiPagination
        v-if="totalPages > 0 && !isLoading"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="perPage"
        @change="handlePageChange"
      />
    </template>

    <!-- Status Change Modal -->
    <UiModal
      v-model="showStatusModal"
      title="상태 변경"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        선택한 <span class="font-medium text-neutral-900">{{ selectedIds.length }}건</span>의 상태를 변경합니다.
      </p>

      <div class="space-y-2 max-h-72 overflow-y-auto">
        <label
          v-for="option in claimStatusOptions"
          :key="option.value"
          :class="[
            'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
            selectedStatus === option.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-neutral-300',
          ]"
        >
          <input
            v-model="selectedStatus"
            type="radio"
            :value="option.value"
            class="w-4 h-4 text-primary-600 focus:ring-primary-500"
          >
          <span class="font-medium">{{ option.label }}</span>
          <UiBadge :variant="statusMap[option.value]?.variant" size="sm" class="ml-auto">
            {{ option.label }}
          </UiBadge>
        </label>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton
            variant="outline"
            @click="showStatusModal = false"
          >
            취소
          </UiButton>
          <UiButton
            variant="primary"
            :disabled="!selectedStatus"
            @click="handleStatusChange"
          >
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
