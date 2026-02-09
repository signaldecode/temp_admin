<script setup>
/**
 * 리뷰 목록 페이지
 * - 리뷰 조회 전용 (수정 불가, 삭제만 가능)
 */

import { useUiStore } from '~/stores/ui'
import { formatDate } from '~/utils/formatters'

const router = useRouter()
const uiStore = useUiStore()

// 목데이터
const mockReviews = [
  {
    id: 1,
    productId: 101,
    productName: '프리미엄 오가닉 코튼 티셔츠',
    productImage: 'https://picsum.photos/seed/product1/200',
    userId: 1001,
    userName: '김민수',
    rating: 5,
    title: '정말 만족스러운 구매였어요!',
    content: '품질이 정말 좋아요! 면 소재가 부드럽고 착용감이 편안합니다. 다음에도 재구매 의사 있습니다.',
    images: ['https://picsum.photos/seed/review1/400', 'https://picsum.photos/seed/review2/400'],
    createdAt: '2025-02-01T10:30:00',
    updatedAt: '2025-02-01T10:30:00',
  },
  {
    id: 2,
    productId: 102,
    productName: '클래식 데님 자켓',
    productImage: 'https://picsum.photos/seed/product2/200',
    userId: 1002,
    userName: '이영희',
    rating: 4,
    title: '사이즈 참고하세요',
    content: '디자인은 마음에 드는데 사이즈가 조금 크게 나온 것 같아요. 한 사이즈 작게 주문하시는 걸 추천드립니다.',
    images: [],
    createdAt: '2025-02-02T14:20:00',
    updatedAt: '2025-02-02T14:20:00',
  },
  {
    id: 3,
    productId: 103,
    productName: '스포츠 러닝화',
    productImage: 'https://picsum.photos/seed/product3/200',
    userId: 1003,
    userName: '박철수',
    rating: 5,
    title: '운동하기 딱 좋아요',
    content: '운동할 때 착용하기 정말 좋습니다. 가볍고 쿠션감도 좋아요.',
    images: ['https://picsum.photos/seed/review3/400'],
    createdAt: '2025-02-03T09:15:00',
    updatedAt: '2025-02-03T09:15:00',
  },
  {
    id: 4,
    productId: 104,
    productName: '가죽 크로스백',
    productImage: 'https://picsum.photos/seed/product4/200',
    userId: 1004,
    userName: '정수진',
    rating: 3,
    title: '배송이 아쉬웠어요',
    content: '가격 대비 품질은 괜찮은데, 배송이 좀 늦었어요.',
    images: [],
    createdAt: '2025-02-04T16:45:00',
    updatedAt: '2025-02-04T16:45:00',
  },
  {
    id: 5,
    productId: 105,
    productName: '울 블렌드 코트',
    productImage: 'https://picsum.photos/seed/product5/200',
    userId: 1005,
    userName: '최동훈',
    rating: 5,
    title: '겨울 필수템!',
    content: '겨울에 따뜻하게 입기 좋습니다. 핏도 예쁘고 색상도 사진과 동일해요.',
    images: ['https://picsum.photos/seed/review4/400', 'https://picsum.photos/seed/review5/400'],
    createdAt: '2025-02-05T11:00:00',
    updatedAt: '2025-02-05T11:00:00',
  },
  {
    id: 6,
    productId: 106,
    productName: '스트라이프 셔츠',
    productImage: 'https://picsum.photos/seed/product6/200',
    userId: 1006,
    userName: '한미영',
    rating: 4,
    title: '출근룩으로 추천',
    content: '출근용으로 구매했는데 깔끔하고 좋습니다.',
    images: [],
    createdAt: '2025-02-06T08:30:00',
    updatedAt: '2025-02-06T08:30:00',
  },
  {
    id: 7,
    productId: 107,
    productName: '캐시미어 니트',
    productImage: 'https://picsum.photos/seed/product7/200',
    userId: 1007,
    userName: '오지훈',
    rating: 2,
    title: '관리가 어려워요',
    content: '첫 세탁 후 보풀이 많이 생겼어요. 관리가 까다로울 것 같습니다.',
    images: ['https://picsum.photos/seed/review6/400'],
    createdAt: '2025-02-07T13:20:00',
    updatedAt: '2025-02-07T13:20:00',
  },
  {
    id: 8,
    productId: 108,
    productName: '슬림핏 청바지',
    productImage: 'https://picsum.photos/seed/product8/200',
    userId: 1008,
    userName: '김하나',
    rating: 5,
    title: '핏이 예뻐요',
    content: '핏이 정말 예뻐요! 다리가 길어보이는 효과가 있습니다.',
    images: [],
    createdAt: '2025-02-08T17:10:00',
    updatedAt: '2025-02-08T17:10:00',
  },
]

// 리뷰 목록
const reviews = ref([...mockReviews])

// 로딩 상태
const isLoading = ref(false)

// 필터
const filterRating = ref('')
const searchKeyword = ref('')

// 페이지네이션
const currentPage = ref(1)
const perPage = 20
const totalItems = ref(mockReviews.length)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage))

// 리뷰 목록 조회 (목데이터)
const fetchReviews = async () => {
  isLoading.value = true

  // 로딩 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300))

  let result = [...mockReviews]

  // 평점 필터
  if (filterRating.value) {
    result = result.filter(r => r.rating === Number(filterRating.value))
  }

  reviews.value = result
  totalItems.value = result.length
  selectedIds.value = []
  isLoading.value = false
}

// 프론트 필터링 (keyword)
const filteredReviews = computed(() => {
  let result = [...reviews.value]
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (r) =>
        r.productName?.toLowerCase().includes(keyword) ||
        r.userName?.toLowerCase().includes(keyword) ||
        r.title?.toLowerCase().includes(keyword) ||
        r.content?.toLowerCase().includes(keyword)
    )
  }
  return result
})

// 테이블 컬럼
const tableColumns = [
  { key: 'product', label: '상품', width: 'w-48' },
  { key: 'user', label: '작성자', width: 'w-28' },
  { key: 'rating', label: '평점', width: 'w-24', align: 'center' },
  { key: 'title', label: '제목' },
  { key: 'createdAt', label: '작성일', width: 'w-28' },
]

// 벌크 선택
const selectedIds = ref([])
const handleSelectAll = (selectAll) => {
  selectedIds.value = selectAll ? filteredReviews.value.map((r) => r.id) : []
}
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

// 벌크 삭제 (목데이터)
const bulkDelete = () => {
  if (!selectedIds.value.length) return
  if (!confirm(`선택한 ${selectedIds.value.length}개의 리뷰를 삭제하시겠습니까?`)) return

  reviews.value = reviews.value.filter(r => !selectedIds.value.includes(r.id))
  totalItems.value = reviews.value.length
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
}

// 별점 렌더링
const renderStars = (rating) => {
  const filled = Math.floor(rating || 0)
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

// 페이지 이동
const goToDetail = (review) => router.push(`/admin/contents/reviews/${review.id}`)

// 검색
const handleSearch = () => {
  currentPage.value = 1
  fetchReviews()
}
const handleReset = () => {
  filterRating.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
  fetchReviews()
}

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page
  fetchReviews()
}

// 초기 로드
onMounted(() => {
  fetchReviews()
})
</script>

<template>
  <LayoutListPage title="리뷰 관리" description="상품 리뷰를 관리합니다.">
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterRating"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">평점 전체</option>
            <option value="5">5점</option>
            <option value="4">4점</option>
            <option value="3">3점</option>
            <option value="2">2점</option>
            <option value="1">1점</option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="제목, 상품명, 작성자로 검색"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="danger" size="sm" @click="bulkDelete">삭제</UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- 로딩 -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-white rounded-lg border border-neutral-200">
      <UiSpinner size="lg" />
    </div>

    <DomainDataTable
      v-else
      :columns="tableColumns"
      :items="filteredReviews"
      :selected-ids="selectedIds"
      selectable
      empty-title="등록된 리뷰가 없습니다"
      empty-description="아직 작성된 리뷰가 없습니다."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="goToDetail"
    >
      <template #cell-product="{ item }">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
            <img
              v-if="item.productImage"
              :src="item.productImage"
              :alt="item.productName"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center text-neutral-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <p class="text-sm font-medium text-neutral-900 truncate">{{ item.productName || '-' }}</p>
        </div>
      </template>

      <template #cell-user="{ item }">
        <p class="text-sm text-neutral-600">{{ item.userName || '-' }}</p>
      </template>

      <template #cell-rating="{ item }">
        <span class="text-sm text-warning-500">{{ renderStars(item.rating) }}</span>
      </template>

      <template #cell-title="{ item }">
        <p class="text-sm text-neutral-900 line-clamp-1">{{ item.title || '-' }}</p>
      </template>

      <template #cell-createdAt="{ item }">
        <span class="text-sm text-neutral-500">{{ item.createdAt ? formatDate(item.createdAt) : '-' }}</span>
      </template>

      <template #mobile-card="{ item }">
        <div class="space-y-2">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
              <img v-if="item.productImage" :src="item.productImage" :alt="item.productName" class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 truncate">{{ item.title || '-' }}</p>
              <p class="text-xs text-neutral-500 truncate">{{ item.productName || '-' }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs text-neutral-500">{{ item.userName || '-' }}</span>
                <span class="text-xs text-warning-500">{{ renderStars(item.rating) }}</span>
              </div>
            </div>
          </div>
          <p class="text-xs text-neutral-400">{{ item.createdAt ? formatDate(item.createdAt) : '-' }}</p>
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
</template>
