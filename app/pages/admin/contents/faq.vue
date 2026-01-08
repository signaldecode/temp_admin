<script setup>
/**
 * FAQ 관리 페이지
 * - 자주 묻는 질문 관리
 * - 카테고리별 분류
 * - 노출 순서 관리
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 카테고리 옵션
const categoryOptions = [
  { value: 'order', label: '주문/결제' },
  { value: 'delivery', label: '배송' },
  { value: 'exchange', label: '교환/반품/환불' },
  { value: 'member', label: '회원/포인트' },
  { value: 'product', label: '상품' },
  { value: 'etc', label: '기타' },
]

// Mock FAQ 데이터
const faqList = ref([
  {
    id: 1,
    category: 'delivery',
    question: '배송은 얼마나 걸리나요?',
    answer: '일반 배송은 결제 완료 후 2-3일 내 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다.',
    order: 1,
    isActive: true,
    viewCount: 1250,
    createdAt: '2024-06-01',
  },
  {
    id: 2,
    category: 'delivery',
    question: '배송비는 얼마인가요?',
    answer: '3만원 이상 구매 시 무료배송입니다. 3만원 미만 주문 시 배송비 3,000원이 부과됩니다.',
    order: 2,
    isActive: true,
    viewCount: 980,
    createdAt: '2024-06-01',
  },
  {
    id: 3,
    category: 'exchange',
    question: '교환/반품은 어떻게 하나요?',
    answer: '마이페이지 > 주문내역에서 교환/반품 신청이 가능합니다. 상품 수령 후 7일 이내에 신청해주세요.',
    order: 1,
    isActive: true,
    viewCount: 850,
    createdAt: '2024-06-01',
  },
  {
    id: 4,
    category: 'exchange',
    question: '환불은 언제 되나요?',
    answer: '반품 상품 입고 확인 후 영업일 기준 3-5일 내 환불 처리됩니다. 카드 결제의 경우 카드사에 따라 2-3일 추가 소요될 수 있습니다.',
    order: 2,
    isActive: true,
    viewCount: 720,
    createdAt: '2024-06-01',
  },
  {
    id: 5,
    category: 'member',
    question: '포인트는 어떻게 사용하나요?',
    answer: '결제 시 보유 포인트를 1포인트 = 1원으로 사용 가능합니다. 최소 사용 단위는 1,000포인트입니다.',
    order: 1,
    isActive: true,
    viewCount: 560,
    createdAt: '2024-06-01',
  },
  {
    id: 6,
    category: 'order',
    question: '주문 취소는 어떻게 하나요?',
    answer: '배송 준비 전까지 마이페이지 > 주문내역에서 취소 가능합니다. 배송 시작 후에는 고객센터로 문의해주세요.',
    order: 1,
    isActive: true,
    viewCount: 430,
    createdAt: '2024-06-01',
  },
  {
    id: 7,
    category: 'product',
    question: '상품 재입고 알림 받을 수 있나요?',
    answer: '품절 상품 페이지에서 "재입고 알림 신청" 버튼을 눌러주세요. 재입고 시 알림톡으로 안내드립니다.',
    order: 1,
    isActive: false,
    viewCount: 180,
    createdAt: '2024-08-15',
  },
])

// 필터
const filterCategory = ref('')
const filterActive = ref('')
const searchKeyword = ref('')

// 필터링된 목록
const filteredList = computed(() => {
  let result = [...faqList.value]

  if (filterCategory.value) {
    result = result.filter((f) => f.category === filterCategory.value)
  }

  if (filterActive.value !== '') {
    const isActive = filterActive.value === 'true'
    result = result.filter((f) => f.isActive === isActive)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((f) => f.question.toLowerCase().includes(keyword))
  }

  return result.sort((a, b) => {
    if (a.category !== b.category) {
      return categoryOptions.findIndex((c) => c.value === a.category) -
             categoryOptions.findIndex((c) => c.value === b.category)
    }
    return a.order - b.order
  })
})

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'order', label: '순서', width: 'w-12' },
  { key: 'category', label: '카테고리' },
  { key: 'question', label: '질문' },
  { key: 'viewCount', label: '조회수' },
  { key: 'isActive', label: '상태' },
]

// 벌크 선택
const selectedIds = ref([])

const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = paginatedList.value.map((f) => f.id)
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
  if (!confirm(`선택한 ${selectedIds.value.length}개의 FAQ를 삭제하시겠습니까?`)) return

  faqList.value = faqList.value.filter((f) => !selectedIds.value.includes(f.id))
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: '선택한 FAQ가 삭제되었습니다.',
  })
}

// 벌크 활성화/비활성화
const bulkToggleActive = (isActive) => {
  if (selectedIds.value.length === 0) return

  faqList.value = faqList.value.map((f) => {
    if (selectedIds.value.includes(f.id)) {
      return { ...f, isActive }
    }
    return f
  })
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: isActive ? 'FAQ가 활성화되었습니다.' : 'FAQ가 비활성화되었습니다.',
  })
}

// 카테고리 라벨
const getCategoryLabel = (category) => {
  return categoryOptions.find((c) => c.value === category)?.label || category
}

// 상세/편집 모달
const showDetailModal = ref(false)
const isEditMode = ref(false)
const selectedFaq = ref(null)

const editForm = ref({
  category: 'order',
  question: '',
  answer: '',
  order: 1,
  isActive: true,
})

// FAQ 상세 보기
const viewFaq = (faq) => {
  selectedFaq.value = faq
  editForm.value = {
    category: faq.category,
    question: faq.question,
    answer: faq.answer,
    order: faq.order,
    isActive: faq.isActive,
  }
  isEditMode.value = false
  showDetailModal.value = true
}

// 새 FAQ 등록
const createFaq = () => {
  selectedFaq.value = null
  editForm.value = {
    category: 'order',
    question: '',
    answer: '',
    order: 1,
    isActive: true,
  }
  isEditMode.value = true
  showDetailModal.value = true
}

// 편집 모드 전환
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 저장
const saveFaq = () => {
  if (!editForm.value.question.trim() || !editForm.value.answer.trim()) {
    uiStore.showToast({
      type: 'error',
      message: '질문과 답변을 모두 입력해주세요.',
    })
    return
  }

  if (selectedFaq.value) {
    const index = faqList.value.findIndex((f) => f.id === selectedFaq.value.id)
    if (index > -1) {
      faqList.value[index] = {
        ...faqList.value[index],
        ...editForm.value,
      }
    }
    uiStore.showToast({
      type: 'success',
      message: 'FAQ가 수정되었습니다.',
    })
  } else {
    const newFaq = {
      id: Date.now(),
      ...editForm.value,
      viewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    faqList.value.push(newFaq)
    uiStore.showToast({
      type: 'success',
      message: 'FAQ가 등록되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 삭제
const deleteFaq = (faq) => {
  if (!confirm('이 FAQ를 삭제하시겠습니까?')) return

  const index = faqList.value.findIndex((f) => f.id === faq.id)
  if (index > -1) {
    faqList.value.splice(index, 1)
    uiStore.showToast({
      type: 'success',
      message: 'FAQ가 삭제되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 활성화 토글
const toggleActive = (faq) => {
  const index = faqList.value.findIndex((f) => f.id === faq.id)
  if (index > -1) {
    faqList.value[index].isActive = !faqList.value[index].isActive
    uiStore.showToast({
      type: 'success',
      message: faqList.value[index].isActive ? 'FAQ가 활성화되었습니다.' : 'FAQ가 비활성화되었습니다.',
    })
  }
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
}

// 검색 초기화
const handleReset = () => {
  filterCategory.value = ''
  filterActive.value = ''
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
  <LayoutListPage title="FAQ 관리" description="자주 묻는 질문을 관리합니다.">
    <!-- Actions -->
    <template #actions>
      <UiButton variant="primary" @click="createFaq">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        FAQ 등록
      </UiButton>
    </template>

    <!-- Filters -->
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterCategory"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">카테고리 전체</option>
            <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select
            v-model="filterActive"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">상태 전체</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="질문 검색"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <!-- Bulk Actions -->
    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="outline" size="sm" @click="bulkToggleActive(true)">
          활성화
        </UiButton>
        <UiButton variant="outline" size="sm" @click="bulkToggleActive(false)">
          비활성화
        </UiButton>
        <UiButton variant="danger" size="sm" @click="bulkDelete">
          삭제
        </UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- FAQ List -->
    <DomainDataTable
      :columns="tableColumns"
      :items="paginatedList"
      :selected-ids="selectedIds"
      selectable
      empty-title="FAQ가 없습니다"
      empty-description="새 FAQ를 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="viewFaq"
    >
      <!-- 순서 -->
      <template #cell-order="{ item }">
        <span class="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">
          {{ item.order }}
        </span>
      </template>

      <!-- 카테고리 -->
      <template #cell-category="{ item }">
        <span class="text-sm text-neutral-600">{{ getCategoryLabel(item.category) }}</span>
      </template>

      <!-- 질문 -->
      <template #cell-question="{ item }">
        <span class="text-sm font-medium text-neutral-900 truncate max-w-md">{{ item.question }}</span>
      </template>

      <!-- 조회수 -->
      <template #cell-viewCount="{ item }">
        <span class="text-sm text-neutral-500">{{ item.viewCount.toLocaleString() }}</span>
      </template>

      <!-- 상태 -->
      <template #cell-isActive="{ item }">
        <button
          type="button"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            item.isActive ? 'bg-primary-600' : 'bg-neutral-200',
          ]"
          @click.stop="toggleActive(item)"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              item.isActive ? 'translate-x-5' : 'translate-x-0',
            ]"
          />
        </button>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">
              {{ item.order }}
            </span>
            <span class="text-xs text-neutral-500">{{ getCategoryLabel(item.category) }}</span>
          </div>
          <UiBadge :variant="item.isActive ? 'success' : 'neutral'" size="sm">
            {{ item.isActive ? '활성' : '비활성' }}
          </UiBadge>
        </div>
        <p class="text-sm font-medium text-neutral-900 line-clamp-2">{{ item.question }}</p>
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

    <!-- Detail/Edit Modal -->
    <UiModal
      v-model="showDetailModal"
      :title="selectedFaq ? (isEditMode ? 'FAQ 수정' : 'FAQ 상세') : 'FAQ 등록'"
      size="lg"
    >
      <div class="space-y-4">
        <!-- 카테고리 & 순서 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">카테고리</label>
            <select
              v-if="isEditMode"
              v-model="editForm.category"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option
                v-for="option in categoryOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <p v-else class="text-sm text-neutral-900">{{ getCategoryLabel(editForm.category) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">노출 순서</label>
            <input
              v-if="isEditMode"
              v-model.number="editForm.order"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
            <p v-else class="text-sm text-neutral-900">{{ editForm.order }}</p>
          </div>
        </div>

        <!-- 활성 상태 -->
        <div v-if="isEditMode" class="flex items-center gap-3">
          <label class="text-sm font-medium text-neutral-700">활성 상태</label>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              editForm.isActive ? 'bg-primary-600' : 'bg-neutral-200',
            ]"
            @click="editForm.isActive = !editForm.isActive"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                editForm.isActive ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
          <span class="text-sm text-neutral-500">{{ editForm.isActive ? '활성' : '비활성' }}</span>
        </div>

        <!-- 질문 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">질문</label>
          <input
            v-if="isEditMode"
            v-model="editForm.question"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="질문을 입력하세요"
          >
          <p v-else class="text-sm text-neutral-900">{{ editForm.question }}</p>
        </div>

        <!-- 답변 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">답변</label>
          <textarea
            v-if="isEditMode"
            v-model="editForm.answer"
            rows="5"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="답변을 입력하세요"
          />
          <div v-else class="p-4 bg-neutral-50 rounded-lg">
            <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ editForm.answer }}</p>
          </div>
        </div>

        <!-- 통계 -->
        <div v-if="selectedFaq && !isEditMode" class="pt-4 border-t border-neutral-200">
          <div class="bg-neutral-50 p-3 rounded-lg">
            <p class="text-xs text-neutral-500">조회수</p>
            <p class="text-lg font-semibold text-neutral-900">{{ selectedFaq.viewCount.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <UiButton
              v-if="selectedFaq && !isEditMode"
              variant="danger"
              @click="deleteFaq(selectedFaq)"
            >
              삭제
            </UiButton>
          </div>
          <div class="flex gap-2">
            <UiButton
              variant="outline"
              @click="showDetailModal = false"
            >
              {{ isEditMode ? '취소' : '닫기' }}
            </UiButton>
            <UiButton
              v-if="!isEditMode && selectedFaq"
              variant="secondary"
              @click="toggleEditMode"
            >
              수정
            </UiButton>
            <UiButton
              v-if="isEditMode"
              variant="primary"
              @click="saveFaq"
            >
              저장
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
