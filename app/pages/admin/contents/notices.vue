<script setup>
/**
 * 공지사항 관리 페이지
 * - 공지사항 목록 및 작성
 * - 카테고리, 상단 고정, 노출 관리
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 카테고리 옵션
const categoryOptions = [
  { value: 'notice', label: '공지' },
  { value: 'event', label: '이벤트' },
  { value: 'update', label: '업데이트' },
  { value: 'system', label: '시스템' },
]

// Mock 공지사항 데이터
const notices = ref([
  {
    id: 1,
    category: 'notice',
    title: '2025년 설 연휴 배송 안내',
    content: `안녕하세요.

2025년 설 연휴 기간 배송 일정을 안내드립니다.

■ 휴무 기간: 1월 28일(화) ~ 1월 30일(목)
■ 휴무 전 마감: 1월 27일(월) 오후 2시까지 결제 완료 건

휴무 기간 중 주문 건은 1월 31일(금)부터 순차 발송됩니다.

감사합니다.`,
    isPinned: true,
    isActive: true,
    viewCount: 2450,
    createdAt: '2025-01-06',
    author: '관리자',
  },
  {
    id: 2,
    category: 'event',
    title: '신년 특별 이벤트 안내',
    content: `2025년 새해를 맞아 특별 이벤트를 진행합니다!

■ 이벤트 기간: 1월 1일 ~ 1월 31일
■ 이벤트 내용: 전 상품 10% 할인 + 적립금 2배

많은 참여 부탁드립니다.`,
    isPinned: true,
    isActive: true,
    viewCount: 1890,
    createdAt: '2025-01-01',
    author: '관리자',
  },
  {
    id: 3,
    category: 'update',
    title: '앱 버전 2.0 업데이트 안내',
    content: `앱 버전 2.0이 출시되었습니다.

■ 주요 변경사항
- UI/UX 전면 개편
- 결제 프로세스 개선
- 위시리스트 기능 추가
- 알림 설정 세분화

앱스토어에서 업데이트해주세요.`,
    isPinned: false,
    isActive: true,
    viewCount: 980,
    createdAt: '2025-01-05',
    author: '관리자',
  },
  {
    id: 4,
    category: 'system',
    title: '서버 점검 안내 (1/10)',
    content: `서버 점검이 예정되어 있습니다.

■ 점검 일시: 1월 10일(금) 02:00 ~ 06:00
■ 점검 내용: 서버 안정화 작업

점검 시간 동안 서비스 이용이 제한됩니다.
양해 부탁드립니다.`,
    isPinned: false,
    isActive: true,
    viewCount: 560,
    createdAt: '2025-01-06',
    author: '관리자',
  },
  {
    id: 5,
    category: 'notice',
    title: '개인정보 처리방침 변경 안내',
    content: `개인정보 처리방침이 변경됨을 안내드립니다.

■ 시행일: 2025년 2월 1일
■ 변경 내용: 마케팅 정보 수신 동의 조항 명확화

자세한 내용은 개인정보 처리방침 페이지를 참고해주세요.`,
    isPinned: false,
    isActive: false,
    viewCount: 120,
    createdAt: '2024-12-20',
    author: '관리자',
  },
])

// 필터
const filterCategory = ref('')
const filterActive = ref('')
const searchKeyword = ref('')

// 필터링된 목록
const filteredList = computed(() => {
  let result = [...notices.value]

  if (filterCategory.value) {
    result = result.filter((n) => n.category === filterCategory.value)
  }

  if (filterActive.value !== '') {
    const isActive = filterActive.value === 'true'
    result = result.filter((n) => n.isActive === isActive)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((n) => n.title.toLowerCase().includes(keyword))
  }

  // 고정 공지를 먼저, 그 다음 최신순
  return result.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned - a.isPinned
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'isPinned', label: '고정', width: 'w-12' },
  { key: 'category', label: '카테고리' },
  { key: 'title', label: '제목' },
  { key: 'viewCount', label: '조회수' },
  { key: 'createdAt', label: '작성일' },
  { key: 'isActive', label: '상태' },
]

// 벌크 선택
const selectedIds = ref([])

const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = paginatedList.value.map((n) => n.id)
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
  if (!confirm(`선택한 ${selectedIds.value.length}개의 공지사항을 삭제하시겠습니까?`)) return

  notices.value = notices.value.filter((n) => !selectedIds.value.includes(n.id))
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: '선택한 공지사항이 삭제되었습니다.',
  })
}

// 벌크 노출/숨김
const bulkToggleActive = (isActive) => {
  if (selectedIds.value.length === 0) return

  notices.value = notices.value.map((n) => {
    if (selectedIds.value.includes(n.id)) {
      return { ...n, isActive }
    }
    return n
  })
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: isActive ? '공지사항이 노출되었습니다.' : '공지사항이 숨김 처리되었습니다.',
  })
}

// 카테고리 라벨
const getCategoryLabel = (category) => {
  return categoryOptions.find((c) => c.value === category)?.label || category
}

// 카테고리 색상
const getCategoryColor = (category) => {
  const colors = {
    notice: 'primary',
    event: 'warning',
    update: 'info',
    system: 'error',
  }
  return colors[category] || 'neutral'
}

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

// 상세/편집 모달
const showDetailModal = ref(false)
const isEditMode = ref(false)
const selectedNotice = ref(null)

const editForm = ref({
  category: 'notice',
  title: '',
  content: '',
  isPinned: false,
  isActive: true,
})

// 공지사항 상세 보기
const viewNotice = (notice) => {
  selectedNotice.value = notice
  editForm.value = {
    category: notice.category,
    title: notice.title,
    content: notice.content,
    isPinned: notice.isPinned,
    isActive: notice.isActive,
  }
  isEditMode.value = false
  showDetailModal.value = true
}

// 새 공지사항 등록
const createNotice = () => {
  selectedNotice.value = null
  editForm.value = {
    category: 'notice',
    title: '',
    content: '',
    isPinned: false,
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
const saveNotice = () => {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    uiStore.showToast({
      type: 'error',
      message: '제목과 내용을 모두 입력해주세요.',
    })
    return
  }

  if (selectedNotice.value) {
    const index = notices.value.findIndex((n) => n.id === selectedNotice.value.id)
    if (index > -1) {
      notices.value[index] = {
        ...notices.value[index],
        ...editForm.value,
      }
    }
    uiStore.showToast({
      type: 'success',
      message: '공지사항이 수정되었습니다.',
    })
  } else {
    const newNotice = {
      id: Date.now(),
      ...editForm.value,
      viewCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      author: '관리자',
    }
    notices.value.unshift(newNotice)
    uiStore.showToast({
      type: 'success',
      message: '공지사항이 등록되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 삭제
const deleteNotice = (notice) => {
  if (!confirm('이 공지사항을 삭제하시겠습니까?')) return

  const index = notices.value.findIndex((n) => n.id === notice.id)
  if (index > -1) {
    notices.value.splice(index, 1)
    uiStore.showToast({
      type: 'success',
      message: '공지사항이 삭제되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 고정 토글
const togglePinned = (notice) => {
  const index = notices.value.findIndex((n) => n.id === notice.id)
  if (index > -1) {
    notices.value[index].isPinned = !notices.value[index].isPinned
    uiStore.showToast({
      type: 'success',
      message: notices.value[index].isPinned ? '상단에 고정되었습니다.' : '고정이 해제되었습니다.',
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
  <LayoutListPage title="공지사항" description="공지사항을 관리합니다.">
    <!-- Actions -->
    <template #actions>
      <UiButton variant="primary" @click="createNotice">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        공지 등록
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
            <option value="true">노출</option>
            <option value="false">숨김</option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="제목 검색"
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
          노출
        </UiButton>
        <UiButton variant="outline" size="sm" @click="bulkToggleActive(false)">
          숨김
        </UiButton>
        <UiButton variant="danger" size="sm" @click="bulkDelete">
          삭제
        </UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- Notice List -->
    <DomainDataTable
      :columns="tableColumns"
      :items="paginatedList"
      :selected-ids="selectedIds"
      selectable
      empty-title="공지사항이 없습니다"
      empty-description="새 공지사항을 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="viewNotice"
    >
      <!-- 고정 -->
      <template #cell-isPinned="{ item }">
        <button
          type="button"
          :class="[
            'p-1 rounded',
            item.isPinned ? 'text-primary-600' : 'text-neutral-300 hover:text-neutral-500',
          ]"
          @click.stop="togglePinned(item)"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
          </svg>
        </button>
      </template>

      <!-- 카테고리 -->
      <template #cell-category="{ item }">
        <UiBadge :variant="getCategoryColor(item.category)" size="sm">
          {{ getCategoryLabel(item.category) }}
        </UiBadge>
      </template>

      <!-- 제목 -->
      <template #cell-title="{ item }">
        <span class="text-sm font-medium text-neutral-900 truncate max-w-md">{{ item.title }}</span>
      </template>

      <!-- 조회수 -->
      <template #cell-viewCount="{ item }">
        <span class="text-sm text-neutral-500">{{ item.viewCount.toLocaleString() }}</span>
      </template>

      <!-- 작성일 -->
      <template #cell-createdAt="{ item }">
        <span class="text-sm text-neutral-500">{{ formatDate(item.createdAt) }}</span>
      </template>

      <!-- 상태 -->
      <template #cell-isActive="{ item }">
        <UiBadge :variant="item.isActive ? 'success' : 'neutral'" size="sm">
          {{ item.isActive ? '노출' : '숨김' }}
        </UiBadge>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <svg
              v-if="item.isPinned"
              class="w-4 h-4 text-primary-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z" />
            </svg>
            <UiBadge :variant="getCategoryColor(item.category)" size="sm">
              {{ getCategoryLabel(item.category) }}
            </UiBadge>
          </div>
          <UiBadge :variant="item.isActive ? 'success' : 'neutral'" size="sm">
            {{ item.isActive ? '노출' : '숨김' }}
          </UiBadge>
        </div>
        <p class="text-sm font-medium text-neutral-900 mb-1 line-clamp-2">{{ item.title }}</p>
        <div class="flex items-center gap-3 text-xs text-neutral-400">
          <span>{{ formatDate(item.createdAt) }}</span>
          <span>조회 {{ item.viewCount.toLocaleString() }}</span>
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

    <!-- Detail/Edit Modal -->
    <UiModal
      v-model="showDetailModal"
      :title="selectedNotice ? (isEditMode ? '공지사항 수정' : '공지사항 상세') : '공지사항 등록'"
      size="lg"
    >
      <div class="space-y-4">
        <!-- 카테고리 & 상태 -->
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
            <p v-else>
              <UiBadge :variant="getCategoryColor(editForm.category)" size="sm">
                {{ getCategoryLabel(editForm.category) }}
              </UiBadge>
            </p>
          </div>
          <div v-if="isEditMode">
            <label class="block text-sm font-medium text-neutral-700 mb-1">노출 상태</label>
            <select
              v-model="editForm.isActive"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option :value="true">노출</option>
              <option :value="false">숨김</option>
            </select>
          </div>
        </div>

        <!-- 상단 고정 -->
        <div v-if="isEditMode" class="flex items-center gap-3">
          <label class="text-sm font-medium text-neutral-700">상단 고정</label>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              editForm.isPinned ? 'bg-primary-600' : 'bg-neutral-200',
            ]"
            @click="editForm.isPinned = !editForm.isPinned"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                editForm.isPinned ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>

        <!-- 제목 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">제목</label>
          <input
            v-if="isEditMode"
            v-model="editForm.title"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="제목을 입력하세요"
          >
          <p v-else class="text-sm text-neutral-900">{{ editForm.title }}</p>
        </div>

        <!-- 내용 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">내용</label>
          <textarea
            v-if="isEditMode"
            v-model="editForm.content"
            rows="10"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="내용을 입력하세요"
          />
          <div v-else class="p-4 bg-neutral-50 rounded-lg max-h-80 overflow-y-auto">
            <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ editForm.content }}</p>
          </div>
        </div>

        <!-- 메타 정보 -->
        <div v-if="selectedNotice && !isEditMode" class="pt-4 border-t border-neutral-200">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-neutral-50 p-3 rounded-lg">
              <p class="text-xs text-neutral-500">조회수</p>
              <p class="text-lg font-semibold text-neutral-900">{{ selectedNotice.viewCount.toLocaleString() }}</p>
            </div>
            <div class="bg-neutral-50 p-3 rounded-lg">
              <p class="text-xs text-neutral-500">작성일</p>
              <p class="text-sm font-medium text-neutral-900">{{ formatDate(selectedNotice.createdAt) }}</p>
              <p class="text-xs text-neutral-500">{{ selectedNotice.author }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <UiButton
              v-if="selectedNotice && !isEditMode"
              variant="danger"
              @click="deleteNotice(selectedNotice)"
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
              v-if="!isEditMode && selectedNotice"
              variant="secondary"
              @click="toggleEditMode"
            >
              수정
            </UiButton>
            <UiButton
              v-if="isEditMode"
              variant="primary"
              @click="saveNotice"
            >
              저장
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
