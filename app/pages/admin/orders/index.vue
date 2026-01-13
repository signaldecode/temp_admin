<script setup>
/**
 * 주문 목록 페이지
 * - 검색: 주문번호, 유저ID, 연락처
 * - 벌크 선택 + 상태 변경
 * - 페이지네이션 (30개)
 */

const router = useRouter()
const route = useRoute()

// 검색 필터
const filterStatus = ref('')
const searchType = ref('orderNo')
const searchKeyword = ref('')

const searchOptions = [
  { value: 'orderNo', label: '주문번호' },
  { value: 'userId', label: '유저ID' },
  { value: 'phone', label: '연락처' },
]

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

// 주문 상태 옵션
const statusOptions = [
  { value: 'pending', label: '결제대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '상품준비중' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소' },
]

// 주문 상태 매핑
const statusMap = {
  pending: { label: '결제대기', variant: 'warning' },
  paid: { label: '결제완료', variant: 'info' },
  preparing: { label: '상품준비중', variant: 'primary' },
  shipping: { label: '배송중', variant: 'info' },
  delivered: { label: '배송완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'error' },
}

// Mock 데이터 로드
const fetchOrders = async () => {
  isLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 300))

  // 전체 Mock 데이터
  const allOrders = [
    { id: 1, orderNo: 'ORD20250108001', orderDate: '2025-01-08 14:30', userId: 'user001', userName: '김철수', phone: '010-1234-5678', address: '서울시 강남구 테헤란로 123', itemCount: 3, payment: '신용카드', totalAmount: 189000, status: 'paid' },
    { id: 2, orderNo: 'ORD20250108002', orderDate: '2025-01-08 15:20', userId: 'user002', userName: '이영희', phone: '010-2345-6789', address: '서울시 서초구 반포대로 45', itemCount: 1, payment: '간편결제', totalAmount: 59000, status: 'preparing' },
    { id: 3, orderNo: 'ORD20250108003', orderDate: '2025-01-08 16:45', userId: 'user003', userName: '박민수', phone: '010-3456-7890', address: '경기도 성남시 분당구 판교로 256', itemCount: 2, payment: '무통장입금', totalAmount: 128000, status: 'shipping' }, 
    { id: 4, orderNo: 'ORD20250107001', orderDate: '2025-01-07 10:15', userId: 'user004', userName: '정수진', phone: '010-4567-8901', address: '서울시 마포구 월드컵북로 396', itemCount: 5, payment: '신용카드', totalAmount: 345000, status: 'delivered' },
    { id: 5, orderNo: 'ORD20250107002', orderDate: '2025-01-07 11:30', userId: 'user005', userName: '최동욱', phone: '010-5678-9012', address: '인천시 연수구 송도국제대로 123', itemCount: 1, payment: '신용카드', totalAmount: 45000, status: 'cancelled' },
    { id: 6, orderNo: 'ORD20250107003', orderDate: '2025-01-07 14:00', userId: 'user006', userName: '강미영', phone: '010-6789-0123', address: '서울시 송파구 올림픽로 300', itemCount: 4, payment: '간편결제', totalAmount: 298000, status: 'delivered' },
    { id: 7, orderNo: 'ORD20250106001', orderDate: '2025-01-06 09:30', userId: 'user007', userName: '윤서준', phone: '010-7890-1234', address: '경기도 고양시 일산서구 킨텍스로 217', itemCount: 2, payment: '신용카드', totalAmount: 87000, status: 'delivered' },
    { id: 8, orderNo: 'ORD20250106002', orderDate: '2025-01-06 13:45', userId: 'user008', userName: '임지현', phone: '010-8901-2345', address: '서울시 영등포구 여의대로 108', itemCount: 1, payment: '신용카드',  totalAmount: 156000, status: 'pending' },
    { id: 9, orderNo: 'ORD20250106003', orderDate: '2025-01-06 17:20', userId: 'user009', userName: '한승우', phone: '010-9012-3456', address: '부산시 해운대구 센텀중앙로 79', itemCount: 3, payment: '신용카드', totalAmount: 234000, status: 'delivered' },
    { id: 10, orderNo: 'ORD20250105001', orderDate: '2025-01-05 11:00', userId: 'user010', userName: '오세영', phone: '010-0123-4567', address: '대구시 수성구 동대구로 123', itemCount: 2, payment: '신용카드',  totalAmount: 67000, status: 'delivered' },
    // 더미 데이터 추가 (페이지네이션 테스트용)
    ...Array.from({ length: 90 }, (_, i) => ({
      id: 11 + i,
      orderNo: `ORD20250${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}${String(100 + i).padStart(3, '0')}`,
      orderDate: `2025-01-0${Math.floor(Math.random() * 8) + 1} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      userId: `user${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      userName: `테스트 회원 ${11 + i}`,
      phone: `010-${String(1000 + i).slice(-4)}-${String(5000 + i).slice(-4)}`,
      address: `서울시 테스트구 테스트로 ${100 + i}`,
      itemCount: Math.floor(Math.random() * 5) + 1,
      payment: ['신용카드', '간편결제', '무통장입금'][Math.floor(Math.random() * 3)],
      totalAmount: Math.floor(Math.random() * 500000) + 10000,
      status: ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'cancelled'][Math.floor(Math.random() * 6)],
    })),
  ]

  // 상태 필터링
  let filtered = allOrders
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

// 주소 축약 (모바일용)
const truncateAddress = (address, maxLength = 20) => {
  if (!address) return '-'
  return address.length > maxLength ? address.slice(0, maxLength) + '...' : address
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 검색 초기화
const handleReset = () => {
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
  { key: 'orderDate', label: '주문일시' },
  { key: 'userId', label: '유저ID' },
  { key: 'phone', label: '연락처' },
  { key: 'address', label: '주소' },
  { key: 'itemCount', label: '건수', align: 'center' },
  { key: 'payment', label: '결제수단', align: 'center' },
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
  console.log('상태 변경:', selectedIds.value, '→', selectedStatus.value)

  // Mock: 로컬 데이터 업데이트
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
    message: `${changedCount}건의 주문 상태가 변경되었습니다.`,
  })
}

// 주문 상세로 이동
const goToDetail = (orderId) => {
  router.push(`/admin/orders/${orderId}`)
}

// 초기 로드
onMounted(() => {
  if (route.query.type) searchType.value = route.query.type
  if (route.query.keyword) searchKeyword.value = route.query.keyword
  if (route.query.status) filterStatus.value = route.query.status
  if (route.query.page) currentPage.value = parseInt(route.query.page) || 1
  fetchOrders()
})

// import
import { useUiStore } from '~/stores/ui'
</script>

<template>
  <LayoutListPage title="주문 목록">
    <!-- Description -->
    <template #description>
      전체 주문 {{ totalItems.toLocaleString() }}건
    </template>

    <!-- Filters -->
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">상태 전체</option>
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
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

      <!-- 주문일시 -->
      <template #cell-orderDate="{ item }">
        <span class="text-sm text-neutral-600">{{ item.orderDate }}</span>
      </template>

      <!-- 유저ID -->
      <template #cell-userId="{ item }">
        <span class="text-sm text-neutral-900">{{ item.userId }}</span>
      </template>

      <!-- 연락처 -->
      <template #cell-phone="{ item }">
        <span class="text-sm text-neutral-600">{{ item.phone }}</span>
      </template>

      <!-- 주소 -->
      <template #cell-address="{ item }">
        <span class="text-sm text-neutral-600" :title="item.address">{{ truncateAddress(item.address, 25) }}</span>
      </template>

      <!-- 건수 -->
      <template #cell-itemCount="{ item }">
        <span class="text-sm text-neutral-700">{{ item.itemCount }}건</span>
      </template>
      <!-- 결제수단 -->
      <template #cell-payment="{ item }">
        <span class="text-sm text-neutral-600">{{ item.payment }}</span>
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
            <p class="text-xs text-neutral-500">{{ item.orderDate }}</p>
          </div>
          <UiBadge :variant="statusMap[item.status]?.variant || 'neutral'" size="sm">
            {{ statusMap[item.status]?.label || item.status }}
          </UiBadge>
        </div>
        <div class="text-sm text-neutral-600 space-y-1">
          <p>{{ item.userId }} ({{ item.userName }})</p>
          <p>{{ item.phone }}</p>
          <p class="text-xs text-neutral-500 truncate">{{ item.address }}</p>
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
      title="주문 상태 변경"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        선택한 <span class="font-medium text-neutral-900">{{ selectedIds.length }}건</span>의 주문 상태를 변경합니다.
      </p>

      <div class="space-y-2">
        <label
          v-for="option in statusOptions"
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
