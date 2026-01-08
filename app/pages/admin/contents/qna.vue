<script setup>
/**
 * Q&A 관리 페이지
 * - 고객 문의 목록 및 답변 관리
 * - 답변 대기/완료 필터링
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 카테고리 옵션
const categoryOptions = [
  { value: 'product', label: '상품문의' },
  { value: 'delivery', label: '배송문의' },
  { value: 'exchange', label: '교환/반품' },
  { value: 'payment', label: '결제문의' },
  { value: 'etc', label: '기타' },
]

// 상태 옵션
const statusOptions = [
  { value: 'pending', label: '답변대기', color: 'warning' },
  { value: 'answered', label: '답변완료', color: 'success' },
]

// Mock Q&A 데이터
const qnaList = ref([
  {
    id: 1,
    category: 'product',
    title: '상품 사이즈 문의드립니다',
    content: '안녕하세요. 키 175cm 몸무게 70kg인데 M사이즈 괜찮을까요?',
    author: '김철수',
    authorId: 'user001',
    status: 'pending',
    isSecret: false,
    createdAt: '2025-01-06 14:30',
    answer: null,
    answeredAt: null,
  },
  {
    id: 2,
    category: 'delivery',
    title: '배송 언제 되나요?',
    content: '주문한지 3일 됐는데 아직 배송 시작 안됐어요.',
    author: '이영희',
    authorId: 'user002',
    status: 'answered',
    isSecret: true,
    createdAt: '2025-01-05 10:20',
    answer: '안녕하세요. 확인 결과 물류센터에서 금일 출고 예정입니다. 내일 중 수령 가능하실 것으로 예상됩니다.',
    answeredAt: '2025-01-05 11:45',
  },
  {
    id: 3,
    category: 'exchange',
    title: '교환 신청합니다',
    content: '사이즈가 작아서 L사이즈로 교환하고 싶습니다.',
    author: '박민수',
    authorId: 'user003',
    status: 'pending',
    isSecret: true,
    createdAt: '2025-01-06 09:15',
    answer: null,
    answeredAt: null,
  },
  {
    id: 4,
    category: 'payment',
    title: '결제 오류 문의',
    content: '카드 결제가 계속 실패합니다. 확인 부탁드립니다.',
    author: '정수진',
    authorId: 'user004',
    status: 'answered',
    isSecret: false,
    createdAt: '2025-01-04 16:00',
    answer: '안녕하세요. 카드사 측 일시적인 오류로 확인됩니다. 다른 카드로 결제하시거나 잠시 후 다시 시도해주세요.',
    answeredAt: '2025-01-04 16:30',
  },
  {
    id: 5,
    category: 'product',
    title: '재입고 언제 되나요?',
    content: '검정색 M사이즈 품절인데 재입고 예정 있나요?',
    author: '최동욱',
    authorId: 'user005',
    status: 'pending',
    isSecret: false,
    createdAt: '2025-01-06 11:00',
    answer: null,
    answeredAt: null,
  },
])

// 필터
const filterStatus = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

// 필터링된 목록
const filteredList = computed(() => {
  let result = [...qnaList.value]

  if (filterStatus.value) {
    result = result.filter((q) => q.status === filterStatus.value)
  }

  if (filterCategory.value) {
    result = result.filter((q) => q.category === filterCategory.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (q) =>
        q.title.toLowerCase().includes(keyword) ||
        q.author.toLowerCase().includes(keyword),
    )
  }

  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'status', label: '상태' },
  { key: 'category', label: '카테고리' },
  { key: 'title', label: '제목' },
  { key: 'author', label: '작성자' },
  { key: 'createdAt', label: '작성일' },
]

// 벌크 선택
const selectedIds = ref([])

const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = paginatedList.value.map((q) => q.id)
  } else {
    selectedIds.value = []
  }
}

const handleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 벌크 삭제
const bulkDelete = () => {
  if (selectedIds.value.length === 0) return
  if (!confirm(`선택한 ${selectedIds.value.length}개의 문의를 삭제하시겠습니까?`)) return

  qnaList.value = qnaList.value.filter((q) => !selectedIds.value.includes(q.id))
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: '선택한 문의가 삭제되었습니다.',
  })
}

// 답변 대기 건수
const pendingCount = computed(() => qnaList.value.filter((q) => q.status === 'pending').length)

// 상태별 배지
const getStatusBadge = (status) => {
  return statusOptions.find((s) => s.value === status) || statusOptions[0]
}

// 카테고리 라벨
const getCategoryLabel = (category) => {
  return categoryOptions.find((c) => c.value === category)?.label || category
}

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '-'
  return date
}

// 상세/답변 모달
const showDetailModal = ref(false)
const selectedQna = ref(null)
const answerText = ref('')

// Q&A 상세 보기
const viewQna = (qna) => {
  selectedQna.value = qna
  answerText.value = qna.answer || ''
  showDetailModal.value = true
}

// 답변 저장
const saveAnswer = () => {
  if (!selectedQna.value || !answerText.value.trim()) return

  const index = qnaList.value.findIndex((q) => q.id === selectedQna.value.id)
  if (index > -1) {
    qnaList.value[index] = {
      ...qnaList.value[index],
      answer: answerText.value,
      answeredAt: new Date().toLocaleString('ko-KR'),
      status: 'answered',
    }
    uiStore.showToast({
      type: 'success',
      message: '답변이 등록되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 삭제
const deleteQna = (qna) => {
  if (!confirm('이 문의를 삭제하시겠습니까?')) return

  const index = qnaList.value.findIndex((q) => q.id === qna.id)
  if (index > -1) {
    qnaList.value.splice(index, 1)
    uiStore.showToast({
      type: 'success',
      message: '문의가 삭제되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
}

// 검색 초기화
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
  <LayoutListPage title="Q&A 관리">
    <!-- Description with pending count -->
    <template #description>
      고객 문의에 답변합니다.
      <span v-if="pendingCount > 0" class="text-warning-600 font-medium">
        (답변 대기 {{ pendingCount }}건)
      </span>
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
            v-model="filterCategory"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">카테고리 전체</option>
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="제목, 작성자 검색"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <!-- Bulk Actions -->
    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="danger" size="sm" @click="bulkDelete">
          삭제
        </UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- Q&A List -->
    <DomainDataTable
      :columns="tableColumns"
      :items="paginatedList"
      :selected-ids="selectedIds"
      selectable
      empty-title="문의가 없습니다"
      empty-description="검색 조건을 변경해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="viewQna"
    >
      <!-- 상태 -->
      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
          {{ getStatusBadge(item.status).label }}
        </UiBadge>
      </template>

      <!-- 카테고리 -->
      <template #cell-category="{ item }">
        <span class="text-sm text-neutral-600">{{ getCategoryLabel(item.category) }}</span>
      </template>

      <!-- 제목 -->
      <template #cell-title="{ item }">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-neutral-900 truncate max-w-xs">{{ item.title }}</span>
          <svg
            v-if="item.isSecret"
            class="w-4 h-4 text-neutral-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </template>

      <!-- 작성자 -->
      <template #cell-author="{ item }">
        <span class="text-sm text-neutral-600">{{ item.author }}</span>
      </template>

      <!-- 작성일 -->
      <template #cell-createdAt="{ item }">
        <span class="text-sm text-neutral-500">{{ formatDate(item.createdAt) }}</span>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
              {{ getStatusBadge(item.status).label }}
            </UiBadge>
            <span class="text-xs text-neutral-500">{{ getCategoryLabel(item.category) }}</span>
          </div>
          <svg
            v-if="item.isSecret"
            class="w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-neutral-900 mb-1 truncate">{{ item.title }}</p>
        <div class="flex items-center gap-3 text-xs text-neutral-400">
          <span>{{ item.author }}</span>
          <span>{{ formatDate(item.createdAt) }}</span>
        </div>
      </template>
    </DomainDataTable>

    <!-- Pagination -->
    <template #pagination>
      <UiPagination
        v-model:currentPage="currentPage"
        :total-pages="totalPages"
        :total-items="filteredList.length"
        :per-page="perPage"
      />
    </template>

    <!-- Detail Modal -->
    <UiModal
      v-model="showDetailModal"
      title="문의 상세"
      size="lg"
    >
      <div v-if="selectedQna" class="space-y-4">
        <!-- 문의 정보 -->
        <div class="flex items-center gap-3 pb-4 border-b border-neutral-200">
          <UiBadge :variant="getStatusBadge(selectedQna.status).color" size="sm">
            {{ getStatusBadge(selectedQna.status).label }}
          </UiBadge>
          <span class="text-sm text-neutral-500">{{ getCategoryLabel(selectedQna.category) }}</span>
          <span v-if="selectedQna.isSecret" class="flex items-center gap-1 text-sm text-neutral-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            비밀글
          </span>
        </div>

        <!-- 제목 -->
        <div>
          <h3 class="text-lg font-medium text-neutral-900">{{ selectedQna.title }}</h3>
          <div class="flex items-center gap-3 mt-1 text-sm text-neutral-500">
            <span>{{ selectedQna.author }}</span>
            <span>{{ formatDate(selectedQna.createdAt) }}</span>
          </div>
        </div>

        <!-- 문의 내용 -->
        <div class="p-4 bg-neutral-50 rounded-lg">
          <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ selectedQna.content }}</p>
        </div>

        <!-- 답변 영역 -->
        <div class="pt-4 border-t border-neutral-200">
          <label class="block text-sm font-medium text-neutral-700 mb-2">
            답변
            <span v-if="selectedQna.answeredAt" class="font-normal text-neutral-400 ml-2">
              ({{ formatDate(selectedQna.answeredAt) }})
            </span>
          </label>
          <textarea
            v-model="answerText"
            rows="5"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="답변을 입력하세요"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <UiButton
            variant="danger"
            @click="deleteQna(selectedQna)"
          >
            삭제
          </UiButton>
          <div class="flex gap-2">
            <UiButton
              variant="outline"
              @click="showDetailModal = false"
            >
              닫기
            </UiButton>
            <UiButton
              variant="primary"
              :disabled="!answerText.trim()"
              @click="saveAnswer"
            >
              답변 저장
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
