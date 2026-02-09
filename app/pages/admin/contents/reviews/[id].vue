<script setup>
/**
 * 리뷰 상세 페이지
 * - 조회 전용 (수정 불가)
 * - 삭제만 가능
 */

import { useUiStore } from '~/stores/ui'
import { formatDate } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const reviewId = computed(() => route.params.id)

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

// 상태
const isLoading = ref(true)

// 리뷰 데이터
const review = ref({
  id: null,
  productId: null,
  productName: '',
  productImage: '',
  userId: null,
  userName: '',
  rating: 0,
  title: '',
  content: '',
  images: [],
  createdAt: null,
  updatedAt: null,
})

// 별점 렌더링
const renderStars = (rating) => {
  const filled = Math.floor(rating || 0)
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
}

// 데이터 로드 (목데이터)
const fetchReview = async () => {
  isLoading.value = true

  // 로딩 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 300))

  const found = mockReviews.find(r => r.id === Number(reviewId.value))
  if (found) {
    review.value = { ...found }
  } else {
    uiStore.showToast({
      type: 'error',
      message: '리뷰를 찾을 수 없습니다.',
    })
    router.push('/admin/contents/reviews')
  }

  isLoading.value = false
}

// 삭제 (목데이터)
const handleDelete = () => {
  if (!confirm('이 리뷰를 삭제하시겠습니까?')) return

  uiStore.showToast({ type: 'success', message: '리뷰가 삭제되었습니다.' })
  router.push('/admin/contents/reviews')
}

// 이미지 새 탭 열기
const openImage = (url) => {
  window.open(url, '_blank')
}

// 뒤로가기
const handleCancel = () => router.back()

onMounted(() => {
  fetchReview()
})
</script>

<template>
  <LayoutFormPage
    title="리뷰 상세"
    description="리뷰 내용을 확인합니다."
  >
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- 상품 정보 -->
      <UiCard title="상품 정보">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              v-if="review.productImage"
              :src="review.productImage"
              :alt="review.productName"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center text-neutral-400">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-base font-medium text-neutral-900">{{ review.productName || '-' }}</p>
            <p class="text-sm text-neutral-500 mt-1">상품 ID: {{ review.productId || '-' }}</p>
          </div>
        </div>
      </UiCard>

      <!-- 작성자 정보 -->
      <UiCard title="작성자 정보">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-neutral-500 mb-1">작성자</p>
            <p class="text-sm text-neutral-900">{{ review.userName || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 mb-1">회원 ID</p>
            <p class="text-sm text-neutral-900">{{ review.userId || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 mb-1">작성일</p>
            <p class="text-sm text-neutral-900">{{ review.createdAt ? formatDate(review.createdAt) : '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-neutral-500 mb-1">수정일</p>
            <p class="text-sm text-neutral-900">{{ review.updatedAt ? formatDate(review.updatedAt) : '-' }}</p>
          </div>
        </div>
      </UiCard>

      <!-- 리뷰 내용 -->
      <UiCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-neutral-900">리뷰 내용</h3>
            <span class="text-lg text-warning-500">{{ renderStars(review.rating) }}</span>
          </div>
        </template>

        <div class="space-y-4">
          <!-- 평점 -->
          <div>
            <p class="text-xs text-neutral-500 mb-1">평점</p>
            <p class="text-sm text-neutral-900">{{ review.rating || 0 }}점</p>
          </div>

          <!-- 제목 -->
          <div>
            <p class="text-xs text-neutral-500 mb-1">제목</p>
            <p class="text-sm font-medium text-neutral-900">{{ review.title || '-' }}</p>
          </div>

          <!-- 리뷰 텍스트 -->
          <div>
            <p class="text-xs text-neutral-500 mb-1">내용</p>
            <div class="p-4 bg-neutral-50 rounded-lg">
              <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ review.content || '작성된 내용이 없습니다.' }}</p>
            </div>
          </div>

          <!-- 리뷰 이미지 -->
          <div v-if="review.images && review.images.length > 0">
            <p class="text-xs text-neutral-500 mb-2">첨부 이미지</p>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(image, index) in review.images"
                :key="index"
                class="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden"
              >
                <img
                  :src="image"
                  :alt="`리뷰 이미지 ${index + 1}`"
                  class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  @click="openImage(image)"
                >
              </div>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Footer: 삭제, 취소 버튼만 -->
    <template #footer>
      <UiButton variant="danger" size="lg" @click="handleDelete">삭제</UiButton>
      <UiButton variant="outline" size="lg" @click="handleCancel">취소</UiButton>
    </template>
  </LayoutFormPage>
</template>
