<script setup>
/**
 * 쿠폰 관리 목록 페이지
 */

import { useUiStore } from '~/stores/ui'
import { useCoupon } from '~/composables/useCoupon'
import { formatDate } from '~/utils/formatters'

const router = useRouter()
const uiStore = useUiStore()
const {
  couponTypeOptions,
  issuanceStatusOptions,
  discountMethodOptions,
} = useCoupon()

// 더미 데이터
const mockCoupons = [
  {
    id: 1,
    name: '신규 회원 10% 할인',
    description: '가입 후 7일 이내 사용 가능',
    couponType: 'PRODUCT',
    status: 'ISSUING',
    totalLimit: 1000,
    issuedCount: 342,
    discountMethod: 'RATE',
    discountValue: 10,
    allowOverlap: true,
    minOrderAmount: 30000,
    maxDiscountAmount: 5000,
    validDays: 7,
  },
  {
    id: 2,
    name: '첫 구매 5,000원 할인',
    description: '첫 구매 고객 전용 쿠폰',
    couponType: 'PRODUCT',
    status: 'ISSUING',
    totalLimit: 500,
    issuedCount: 128,
    discountMethod: 'AMOUNT',
    discountValue: 5000,
    allowOverlap: false,
    minOrderAmount: 20000,
    maxDiscountAmount: 0,
    validDays: 30,
  },
  {
    id: 3,
    name: '무료 배송 쿠폰',
    description: '5만원 이상 구매 시 무료 배송',
    couponType: 'SHIPPING',
    status: 'ISSUING',
    totalLimit: 0,
    issuedCount: 1523,
    discountMethod: 'AMOUNT',
    discountValue: 3000,
    allowOverlap: true,
    minOrderAmount: 50000,
    maxDiscountAmount: 0,
    validDays: 30,
  },
  {
    id: 4,
    name: '반품 무료 쿠폰',
    description: '반품 배송비 무료',
    couponType: 'RETURN',
    status: 'STOPPED',
    totalLimit: 200,
    issuedCount: 87,
    discountMethod: 'AMOUNT',
    discountValue: 3000,
    allowOverlap: true,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validDays: 90,
  },
  {
    id: 5,
    name: '교환 무료 쿠폰',
    description: '교환 배송비 무료',
    couponType: 'EXCHANGE',
    status: 'REGISTERED',
    totalLimit: 100,
    issuedCount: 0,
    discountMethod: 'AMOUNT',
    discountValue: 6000,
    allowOverlap: true,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validDays: 90,
  },
  {
    id: 6,
    name: '여름 특별 20% 할인',
    description: '여름 시즌 한정 특별 할인',
    couponType: 'PRODUCT',
    status: 'ENDED',
    totalLimit: 2000,
    issuedCount: 2000,
    discountMethod: 'RATE',
    discountValue: 20,
    allowOverlap: false,
    minOrderAmount: 50000,
    maxDiscountAmount: 10000,
    validityType: 'PERIOD',
    validStartAt: '2025-06-01T00:00',
    validEndAt: '2025-08-31T23:59',
  },
  {
    id: 7,
    name: 'VIP 전용 15% 할인',
    description: 'VIP 등급 회원 전용',
    couponType: 'PRODUCT',
    status: 'ISSUING',
    totalLimit: 0,
    issuedCount: 456,
    discountMethod: 'RATE',
    discountValue: 15,
    allowOverlap: true,
    minOrderAmount: 100000,
    maxDiscountAmount: 20000,
    validDays: 60,
  },
  {
    id: 8,
    name: '앱 설치 3,000원 할인',
    description: '앱 설치 후 첫 주문 시 사용',
    couponType: 'PRODUCT',
    status: 'ISSUING',
    totalLimit: 5000,
    issuedCount: 2341,
    discountMethod: 'AMOUNT',
    discountValue: 3000,
    allowOverlap: true,
    minOrderAmount: 15000,
    maxDiscountAmount: 0,
    validDays: 30,
  },
]

// 쿠폰 목록
const coupons = ref([...mockCoupons])

// 로딩 상태
const isLoading = ref(false)

// 필터
const filterType = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')

// 페이지네이션
const currentPage = ref(1)
const perPage = 20
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage))

// 쿠폰 목록 조회 (목데이터)
const fetchCoupons = async () => {
  isLoading.value = true

  // 로딩 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300))

  let result = [...mockCoupons]

  // 타입 필터
  if (filterType.value) {
    result = result.filter(c => c.couponType === filterType.value)
  }

  // 상태 필터
  if (filterStatus.value) {
    result = result.filter(c => c.status === filterStatus.value)
  }

  // 키워드 검색
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c =>
      c.name?.toLowerCase().includes(keyword) ||
      c.description?.toLowerCase().includes(keyword)
    )
  }

  coupons.value = result
  totalItems.value = result.length
  selectedIds.value = []
  isLoading.value = false
}

// 테이블 컬럼
const tableColumns = [
  { key: 'name', label: '쿠폰명' },
  { key: 'couponType', label: '쿠폰 타입', width: 'w-24', align: 'center' },
  { key: 'discount', label: '할인', width: 'w-28', align: 'right' },
  { key: 'issued', label: '발급/한도', width: 'w-28', align: 'center' },
  { key: 'status', label: '상태', width: 'w-24', align: 'center' },
  { key: 'actions', label: '발급 관리', width: 'w-28', align: 'center' },
]

// 선택
const selectedIds = ref([])
const handleSelectAll = (selectAll) => {
  selectedIds.value = selectAll ? coupons.value.map((c) => c.id) : []
}
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

// 헬퍼 함수
const getStatusBadge = (status) => {
  return issuanceStatusOptions.find((s) => s.value === status) || { label: status || '-', color: 'neutral' }
}

const getCouponTypeLabel = (type) => {
  return couponTypeOptions.find((t) => t.value === type)?.label || type || '-'
}

const formatDiscount = (method, value) => {
  if (method === 'RATE') {
    return `${value}%`
  }
  return `${value?.toLocaleString() || 0}원`
}

const formatIssuedCount = (issued, limit) => {
  const issuedCount = issued?.toLocaleString() || 0
  const limitText = limit === 0 ? '무제한' : limit?.toLocaleString() || 0
  return `${issuedCount} / ${limitText}`
}

// 페이지 이동
const goToCreate = () => router.push('/admin/promotions/coupons/new')
const goToDetail = (coupon) => router.push(`/admin/promotions/coupons/${coupon.id}`)

// 검색
const handleSearch = () => {
  currentPage.value = 1
  fetchCoupons()
}
const handleReset = () => {
  filterType.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  fetchCoupons()
}

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page
  fetchCoupons()
}

// 상태 변경 모달
const showStatusModal = ref(false)
const statusModalData = ref({
  couponId: null,
  couponName: '',
  currentStatus: '',
  targetStatus: '',
  showRecallOption: false,
  recallCoupons: false,
})

const openStatusModal = (coupon, targetStatus) => {
  statusModalData.value = {
    couponId: coupon.id,
    couponName: coupon.name,
    currentStatus: coupon.status,
    targetStatus,
    showRecallOption: targetStatus === 'STOPPED',
    recallCoupons: false,
  }
  showStatusModal.value = true
}

const confirmStatusChange = async () => {
  // 목데이터에서 상태 변경
  const coupon = coupons.value.find(c => c.id === statusModalData.value.couponId)
  if (coupon) {
    coupon.status = statusModalData.value.targetStatus
  }

  if (statusModalData.value.recallCoupons) {
    uiStore.showToast({
      type: 'success',
      message: '쿠폰 발급이 중지되었으며, 미사용 쿠폰이 회수되었습니다.',
    })
  } else {
    uiStore.showToast({
      type: 'success',
      message: '상태가 변경되었습니다.',
    })
  }

  showStatusModal.value = false
}

// 초기 로드
onMounted(() => {
  fetchCoupons()
})
</script>

<template>
  <LayoutListPage title="쿠폰 관리" description="프로모션 쿠폰을 관리합니다.">
    <template #actions>
      <UiButton variant="primary" @click="goToCreate">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        쿠폰 등록
      </UiButton>
    </template>

    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterType"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">타입 전체</option>
            <option v-for="opt in couponTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">상태 전체</option>
            <option v-for="opt in issuanceStatusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="쿠폰명으로 검색"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <!-- 안내 툴팁 -->
    <div class="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-primary-800">
          <p class="font-medium mb-1">쿠폰 운영 안내</p>
          <ul class="text-primary-700 space-y-0.5">
            <li>- 발급중 상태에서는 쿠폰명과 설명만 수정 가능합니다.</li>
            <li>- 발급중지 시 미사용 쿠폰 회수 옵션을 선택할 수 있습니다.</li>
            <li>- 소비자는 한 주문당 최대 1개의 쿠폰만 사용 가능합니다.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-white rounded-lg border border-neutral-200">
      <UiSpinner size="lg" />
    </div>

    <DomainDataTable
      v-else
      :columns="tableColumns"
      :items="coupons"
      :selected-ids="selectedIds"
      selectable
      empty-title="등록된 쿠폰이 없습니다"
      empty-description="새 쿠폰을 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="goToDetail"
    >
      <template #cell-name="{ item }">
        <div>
          <p class="text-sm font-medium text-neutral-900">{{ item.name || '-' }}</p>
          <p v-if="item.description" class="text-xs text-neutral-500 mt-0.5 line-clamp-1">{{ item.description }}</p>
        </div>
      </template>

      <template #cell-couponType="{ item }">
        <span class="text-sm text-neutral-600">{{ getCouponTypeLabel(item.couponType) }}</span>
      </template>

      <template #cell-discount="{ item }">
        <span class="text-sm font-medium text-primary-600">{{ formatDiscount(item.discountMethod, item.discountValue) }}</span>
      </template>

      <template #cell-issued="{ item }">
        <span class="text-sm text-neutral-600">{{ formatIssuedCount(item.issuedCount, item.totalLimit) }}</span>
      </template>

      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
          {{ getStatusBadge(item.status).label }}
        </UiBadge>
      </template>

      <template #cell-actions="{ item }">
        <!-- 등록 → 발급 시작 -->
        <button
          v-if="item.status === 'REGISTERED'"
          class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          @click.stop="openStatusModal(item, 'ISSUING')"
        >
          발급 시작
        </button>

        <!-- 발급중 → 발급 중지 -->
        <button
          v-else-if="item.status === 'ISSUING'"
          class="px-3 py-1.5 text-xs font-medium text-white bg-warning-600 hover:bg-warning-700 rounded-lg transition-colors"
          @click.stop="openStatusModal(item, 'STOPPED')"
        >
          발급 중지
        </button>

        <!-- 발급중지 → 발급 재개 -->
        <button
          v-else-if="item.status === 'STOPPED'"
          class="px-3 py-1.5 text-xs font-medium text-white bg-success-600 hover:bg-success-700 rounded-lg transition-colors"
          @click.stop="openStatusModal(item, 'ISSUING')"
        >
          발급 재개
        </button>

        <!-- 종료 → 비활성 -->
        <span v-else class="text-xs text-neutral-400">-</span>
      </template>

      <template #mobile-card="{ item }">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-neutral-900">{{ item.name || '-' }}</p>
            <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
              {{ getStatusBadge(item.status).label }}
            </UiBadge>
          </div>
          <p v-if="item.description" class="text-xs text-neutral-500 line-clamp-1">{{ item.description }}</p>
          <div class="flex items-center gap-3 text-xs text-neutral-500">
            <span>{{ getCouponTypeLabel(item.couponType) }}</span>
            <span class="font-medium text-primary-600">{{ formatDiscount(item.discountMethod, item.discountValue) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-neutral-400">
              발급: {{ formatIssuedCount(item.issuedCount, item.totalLimit) }}
            </p>
            <!-- 모바일 발급 버튼 -->
            <button
              v-if="item.status === 'REGISTERED'"
              class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg"
              @click.stop="openStatusModal(item, 'ISSUING')"
            >
              발급 시작
            </button>
            <button
              v-else-if="item.status === 'ISSUING'"
              class="px-3 py-1.5 text-xs font-medium text-white bg-warning-600 rounded-lg"
              @click.stop="openStatusModal(item, 'STOPPED')"
            >
              발급 중지
            </button>
            <button
              v-else-if="item.status === 'STOPPED'"
              class="px-3 py-1.5 text-xs font-medium text-white bg-success-600 rounded-lg"
              @click.stop="openStatusModal(item, 'ISSUING')"
            >
              발급 재개
            </button>
          </div>
        </div>
      </template>
    </DomainDataTable>

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
  </LayoutListPage>

  <!-- 상태 변경 모달 -->
  <UiModal v-model:visible="showStatusModal" title="쿠폰 상태 변경">
    <div class="space-y-4">
      <p class="text-sm text-neutral-700">
        <strong>{{ statusModalData.couponName }}</strong> 쿠폰을
        <strong>{{ getStatusBadge(statusModalData.targetStatus).label }}</strong> 상태로 변경하시겠습니까?
      </p>

      <!-- 발급중지 시 회수 옵션 -->
      <div v-if="statusModalData.showRecallOption" class="p-4 bg-warning-50 border border-warning-200 rounded-lg">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="statusModalData.recallCoupons"
            type="checkbox"
            class="mt-0.5 w-4 h-4 text-warning-600 rounded"
          >
          <div>
            <p class="text-sm font-medium text-warning-800">미사용 쿠폰 회수</p>
            <p class="text-xs text-warning-700 mt-0.5">
              고객이 이미 다운로드한 미사용 쿠폰을 회수합니다.<br>
              회수된 쿠폰은 사용자 쿠폰함에서 즉시 사용 불가 처리됩니다.
            </p>
          </div>
        </label>
      </div>
    </div>

    <template #footer>
      <UiButton variant="outline" @click="showStatusModal = false">취소</UiButton>
      <UiButton variant="primary" @click="confirmStatusChange">확인</UiButton>
    </template>
  </UiModal>
</template>
