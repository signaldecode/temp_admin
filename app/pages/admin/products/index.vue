<script setup>
/**
 * 상품 목록 페이지
 * - 검색: 상품명, SKU
 * - 필터: 상태, 할인여부, 신상/인기/추천
 * - 벌크 선택 + 상태 변경
 * - 페이지네이션 (30개)
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

// 검색 필터
const filterStatus = ref('')
const filterDiscount = ref('')
const filterTag = ref('')
const searchType = ref('name')
const searchKeyword = ref('')

const searchOptions = [
  { value: 'name', label: '상품명' },
  { value: 'id', label: '상품ID' },
]

const statusOptions = [
  { value: 'active', label: '판매중' },
  { value: 'inactive', label: '판매중지' },
  { value: 'soldout', label: '품절' },
]

const discountOptions = [
  { value: 'yes', label: '할인중' },
  { value: 'no', label: '할인없음' },
]

const tagOptions = [
  { value: 'new', label: '신상' },
  { value: 'popular', label: '인기' },
  { value: 'recommend', label: '추천' },
]

// 상태 매핑
const statusMap = {
  active: { label: '판매중', variant: 'success' },
  inactive: { label: '판매중지', variant: 'neutral' },
  soldout: { label: '품절', variant: 'error' },
}

// 로딩 상태
const isLoading = ref(false)

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage))

// 상품 목록
const products = ref([])

// 벌크 선택
const selectedIds = ref([])

// 상태 변경 모달
const showStatusModal = ref(false)
const selectedStatus = ref('')

// Mock 데이터 로드
const fetchProducts = async () => {
  isLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 300))

  // 카테고리 목록
  const categoryList = [
    { id: 'cat-1-1', name: '상의', parent: '의류' },
    { id: 'cat-1-2', name: '하의', parent: '의류' },
    { id: 'cat-1-3', name: '아우터', parent: '의류' },
    { id: 'cat-2-1', name: '운동화', parent: '신발' },
    { id: 'cat-2-2', name: '구두', parent: '신발' },
    { id: 'cat-3-1', name: '백팩', parent: '가방' },
    { id: 'cat-4-1', name: '모자', parent: '액세서리' },
  ]

  // 전체 Mock 데이터
  const allProducts = [
    {
      id: 1,
      name: '베이직 코튼 티셔츠',
      categoryId: 'cat-1-1',
      categoryName: '상의',
      thumbnail: '/images/products/1.jpg',
      price: 29000,
      discountType: 'percent',
      discountValue: 10,
      discountPrice: 26100,
      stock: 150,
      status: 'active',
      isNew: true,
      isPopular: false,
      isRecommend: true,
      optionCount: 4,
      createdAt: '2025-01-08',
    },
    {
      id: 2,
      name: '슬림핏 데님 팬츠',
      categoryId: 'cat-1-2',
      categoryName: '하의',
      thumbnail: '/images/products/2.jpg',
      price: 59000,
      discountType: null,
      discountValue: 0,
      discountPrice: 59000,
      stock: 85,
      status: 'active',
      isNew: false,
      isPopular: true,
      isRecommend: false,
      optionCount: 3,
      createdAt: '2025-01-07',
    },
    {
      id: 3,
      name: '오버사이즈 후드 집업',
      categoryId: 'cat-1-3',
      categoryName: '아우터',
      thumbnail: '/images/products/3.jpg',
      price: 89000,
      discountType: 'amount',
      discountValue: 10000,
      discountPrice: 79000,
      stock: 0,
      status: 'soldout',
      isNew: false,
      isPopular: true,
      isRecommend: true,
      optionCount: 5,
      createdAt: '2025-01-06',
    },
    {
      id: 4,
      name: '캐시미어 블렌드 니트',
      categoryId: 'cat-1-1',
      categoryName: '상의',
      thumbnail: '/images/products/4.jpg',
      price: 129000,
      discountType: 'percent',
      discountValue: 20,
      discountPrice: 103200,
      stock: 42,
      status: 'active',
      isNew: true,
      isPopular: false,
      isRecommend: false,
      optionCount: 3,
      createdAt: '2025-01-05',
    },
    {
      id: 5,
      name: '린넨 블렌드 셔츠',
      categoryId: 'cat-1-1',
      categoryName: '상의',
      thumbnail: '/images/products/5.jpg',
      price: 69000,
      discountType: null,
      discountValue: 0,
      discountPrice: 69000,
      stock: 200,
      status: 'inactive',
      isNew: false,
      isPopular: false,
      isRecommend: false,
      optionCount: 2,
      createdAt: '2025-01-04',
    },
    // 더미 데이터 추가
    ...Array.from({ length: 95 }, (_, i) => {
      const cat = categoryList[i % categoryList.length]
      return {
        id: 6 + i,
        name: `테스트 상품 ${6 + i}`,
        categoryId: cat.id,
        categoryName: cat.name,
        thumbnail: `/images/products/${(i % 5) + 1}.jpg`,
        price: Math.floor(Math.random() * 150000) + 10000,
        discountType: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'percent' : 'amount') : null,
        discountValue: Math.random() > 0.6 ? (Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 20000) + 1000) : 0,
        discountPrice: 0,
        stock: Math.floor(Math.random() * 300),
        status: ['active', 'active', 'active', 'inactive', 'soldout'][Math.floor(Math.random() * 5)],
        isNew: Math.random() > 0.7,
        isPopular: Math.random() > 0.8,
        isRecommend: Math.random() > 0.75,
        optionCount: Math.floor(Math.random() * 5) + 1,
        createdAt: `2025-01-${String(Math.floor(Math.random() * 8) + 1).padStart(2, '0')}`,
      }
    }).map((p) => {
      // 할인가 계산
      if (p.discountType === 'percent') {
        p.discountPrice = Math.floor(p.price * (1 - p.discountValue / 100))
      } else if (p.discountType === 'amount') {
        p.discountPrice = p.price - p.discountValue
      } else {
        p.discountPrice = p.price
      }
      return p
    }),
  ]

  // 상태 필터링
  let filtered = allProducts
  if (filterStatus.value) {
    filtered = filtered.filter((p) => p.status === filterStatus.value)
  }

  // 할인 필터링
  if (filterDiscount.value === 'yes') {
    filtered = filtered.filter((p) => p.discountType !== null)
  } else if (filterDiscount.value === 'no') {
    filtered = filtered.filter((p) => p.discountType === null)
  }

  // 태그 필터링
  if (filterTag.value === 'new') {
    filtered = filtered.filter((p) => p.isNew)
  } else if (filterTag.value === 'popular') {
    filtered = filtered.filter((p) => p.isPopular)
  } else if (filterTag.value === 'recommend') {
    filtered = filtered.filter((p) => p.isRecommend)
  }

  // 검색 필터링
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter((p) => {
      switch (searchType.value) {
        case 'name':
          return p.name.toLowerCase().includes(keyword)
        case 'id':
          return String(p.id).includes(keyword)
        default:
          return true
      }
    })
  }

  totalItems.value = filtered.length

  // 페이지네이션
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  products.value = filtered.slice(start, end)

  // 페이지 변경 시 선택 초기화
  selectedIds.value = []

  isLoading.value = false
}

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 할인율/금액 포맷
const formatDiscount = (product) => {
  if (!product.discountType) return '-'
  if (product.discountType === 'percent') {
    return `-${product.discountValue}%`
  }
  return `-${formatCurrency(product.discountValue)}`
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

// 검색 초기화
const handleReset = () => {
  filterStatus.value = ''
  filterDiscount.value = ''
  filterTag.value = ''
  searchType.value = 'name'
  searchKeyword.value = ''
  currentPage.value = 1
  fetchProducts()
}

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'id', label: 'ID', width: 'w-16', align: 'center' },
  { key: 'thumbnail', label: '이미지', width: 'w-16' },
  { key: 'name', label: '상품명' },
  { key: 'category', label: '카테고리' },
  { key: 'price', label: '판매가', align: 'right' },
  { key: 'discount', label: '할인', align: 'center' },
  { key: 'stock', label: '재고', align: 'center' },
  { key: 'tags', label: '태그', align: 'center' },
  { key: 'status', label: '상태', align: 'center' },
]

// 전체 선택/해제
const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = products.value.map((p) => p.id)
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

  // Mock: 로컬 데이터 업데이트
  products.value = products.value.map((product) => {
    if (selectedIds.value.includes(product.id)) {
      return { ...product, status: selectedStatus.value }
    }
    return product
  })

  const changedCount = selectedIds.value.length
  showStatusModal.value = false
  selectedIds.value = []

  uiStore.showToast({
    type: 'success',
    message: `${changedCount}건의 상품 상태가 변경되었습니다.`,
  })
}

// 상품 상세/수정으로 이동
const goToDetail = (productId) => {
  router.push(`/admin/products/${productId}`)
}

// 상품 등록으로 이동
const goToNew = () => {
  router.push('/admin/products/new')
}

// 초기 로드
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <LayoutListPage title="상품 목록">
    <!-- Description -->
    <template #description>
      전체 상품 {{ totalItems.toLocaleString() }}개
    </template>

    <!-- Actions -->
    <template #actions>
      <UiButton variant="primary" @click="goToNew">
        상품 등록
      </UiButton>
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
            v-model="filterDiscount"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">할인 전체</option>
            <option v-for="option in discountOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select
            v-model="filterTag"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">태그 전체</option>
            <option v-for="option in tagOptions" :key="option.value" :value="option.value">
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

    <!-- Product List -->
    <DomainDataTable
      v-else
      :columns="tableColumns"
      :items="products"
      :selected-ids="selectedIds"
      selectable
      empty-title="상품이 없습니다"
      empty-description="상품을 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="(product) => goToDetail(product.id)"
    >
      <!-- ID -->
      <template #cell-id="{ item }">
        <span class="text-sm text-neutral-500 font-mono">{{ item.id }}</span>
      </template>

      <!-- 썸네일 -->
      <template #cell-thumbnail="{ item }">
        <div class="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
          <div class="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
            IMG
          </div>
        </div>
      </template>

      <!-- 상품명 -->
      <template #cell-name="{ item }">
        <div>
          <p class="text-sm font-medium text-neutral-900 line-clamp-1">{{ item.name }}</p>
          <p class="text-xs text-neutral-500">옵션 {{ item.optionCount }}개</p>
        </div>
      </template>

      <!-- 카테고리 -->
      <template #cell-category="{ item }">
        <span class="text-sm text-neutral-600">{{ item.categoryName }}</span>
      </template>

      <!-- 판매가 -->
      <template #cell-price="{ item }">
        <div class="text-right">
          <p v-if="item.discountType" class="text-xs text-neutral-400 line-through">
            {{ formatCurrency(item.price) }}
          </p>
          <p class="text-sm font-medium text-neutral-900">
            {{ formatCurrency(item.discountPrice) }}
          </p>
        </div>
      </template>

      <!-- 할인 -->
      <template #cell-discount="{ item }">
        <span
          v-if="item.discountType"
          class="text-sm font-medium text-error-600"
        >
          {{ formatDiscount(item) }}
        </span>
        <span v-else class="text-sm text-neutral-400">-</span>
      </template>

      <!-- 재고 -->
      <template #cell-stock="{ item }">
        <span
          :class="[
            'text-sm font-medium',
            item.stock === 0 ? 'text-error-600' : item.stock < 10 ? 'text-warning-600' : 'text-neutral-700',
          ]"
        >
          {{ item.stock }}
        </span>
      </template>

      <!-- 태그 -->
      <template #cell-tags="{ item }">
        <div class="flex flex-wrap gap-1 justify-center">
          <UiBadge v-if="item.isNew" variant="info" size="sm">신상</UiBadge>
          <UiBadge v-if="item.isPopular" variant="warning" size="sm">인기</UiBadge>
          <UiBadge v-if="item.isRecommend" variant="success" size="sm">추천</UiBadge>
          <span v-if="!item.isNew && !item.isPopular && !item.isRecommend" class="text-neutral-400">-</span>
        </div>
      </template>

      <!-- 상태 -->
      <template #cell-status="{ item }">
        <UiBadge :variant="statusMap[item.status]?.variant || 'neutral'" size="sm">
          {{ statusMap[item.status]?.label || item.status }}
        </UiBadge>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex gap-3">
          <!-- 썸네일 -->
          <div class="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
            <div class="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
              IMG
            </div>
          </div>

          <!-- 정보 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <p class="text-sm font-medium text-neutral-900 line-clamp-1">{{ item.name }}</p>
              <UiBadge :variant="statusMap[item.status]?.variant" size="sm" class="flex-shrink-0">
                {{ statusMap[item.status]?.label }}
              </UiBadge>
            </div>
            <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span class="font-mono">#{{ item.id }}</span>
              <span>{{ item.categoryName }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="item.discountType" class="text-xs text-neutral-400 line-through">
                {{ formatCurrency(item.price) }}
              </span>
              <span class="text-sm font-semibold text-neutral-900">
                {{ formatCurrency(item.discountPrice) }}
              </span>
              <span v-if="item.discountType" class="text-xs font-medium text-error-600">
                {{ formatDiscount(item) }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-neutral-500">재고 {{ item.stock }}</span>
              <span class="text-xs text-neutral-500">옵션 {{ item.optionCount }}개</span>
            </div>
            <div v-if="item.isNew || item.isPopular || item.isRecommend" class="flex gap-1 mt-2">
              <UiBadge v-if="item.isNew" variant="info" size="sm">신상</UiBadge>
              <UiBadge v-if="item.isPopular" variant="warning" size="sm">인기</UiBadge>
              <UiBadge v-if="item.isRecommend" variant="success" size="sm">추천</UiBadge>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty action -->
      <template #empty>
        <UiButton variant="primary" size="sm" @click="goToNew">
          상품 등록하기
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
      title="상품 상태 변경"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        선택한 <span class="font-medium text-neutral-900">{{ selectedIds.length }}개</span>의 상품 상태를 변경합니다.
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
          <UiButton variant="outline" @click="showStatusModal = false">
            취소
          </UiButton>
          <UiButton variant="primary" :disabled="!selectedStatus" @click="handleStatusChange">
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
