<script setup>
/**
 * 팝업 관리 페이지
 * - 팝업 목록 및 설정
 * - 이미지, 노출기간, 닫기설정, 제목, 내용, 링크, 팝업종류 관리
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 팝업 종류 옵션
const popupTypeOptions = [
  { value: 'layer', label: '레이어 모달', description: '화면 중앙에 모달로 표시' },
  { value: 'fullscreen', label: '풀스크린', description: '전체 화면으로 표시' },
]

// 닫기 설정 옵션
const closeOptions = [
  { value: 'today', label: '오늘 하루 보지 않기' },
  { value: 'week', label: '일주일간 보지 않기' },
  { value: 'month', label: '한달간 보지 않기' },
]

// 상태 옵션
const statusOptions = [
  { value: 'active', label: '노출중', color: 'success' },
  { value: 'scheduled', label: '예약', color: 'info' },
  { value: 'ended', label: '종료', color: 'neutral' },
  { value: 'inactive', label: '비활성', color: 'warning' },
]

// Mock 팝업 데이터
const popups = ref([
  {
    id: 1,
    title: '신년 이벤트 안내',
    image: '/images/popup/newyear.jpg',
    type: 'layer',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    hasEndDate: true,
    closeOption: 'today',
    link: '/event/newyear',
    content: '2025년 신년 이벤트에 참여하세요!',
    viewCount: 1250,
    clickCount: 340,
    createdAt: '2024-12-28',
  },
  {
    id: 2,
    title: '앱 업데이트 공지',
    image: '/images/popup/update.jpg',
    type: 'fullscreen',
    status: 'active',
    startDate: '2025-01-05',
    endDate: '2025-01-15',
    hasEndDate: true,
    closeOption: 'week',
    link: null,
    content: '새로운 기능이 추가되었습니다. 지금 업데이트하세요!',
    viewCount: 890,
    clickCount: 120,
    createdAt: '2025-01-04',
  },
  {
    id: 3,
    title: '설 연휴 배송 안내',
    image: '/images/popup/holiday.jpg',
    type: 'layer',
    status: 'scheduled',
    startDate: '2025-01-20',
    endDate: '2025-02-05',
    hasEndDate: true,
    closeOption: 'today',
    link: '/notice/holiday-shipping',
    content: '설 연휴 배송 일정을 확인해주세요.',
    viewCount: 0,
    clickCount: 0,
    createdAt: '2025-01-06',
  },
  {
    id: 4,
    title: '상시 회원가입 혜택',
    image: '/images/popup/signup.jpg',
    type: 'layer',
    status: 'active',
    startDate: '2024-01-01',
    endDate: null,
    hasEndDate: false,
    closeOption: 'month',
    link: '/signup',
    content: '지금 가입하면 5000원 할인!',
    viewCount: 5420,
    clickCount: 1890,
    createdAt: '2024-01-01',
  },
])

// 필터
const filterType = ref('')
const filterStatus = ref('')
const searchType = ref('all')
const searchKeyword = ref('')

// 검색 타입 옵션
const searchTypeOptions = [
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
]

// 필터링된 팝업
const filteredPopups = computed(() => {
  let result = [...popups.value]

  // 종류 필터
  if (filterType.value) {
    result = result.filter((p) => p.type === filterType.value)
  }

  // 상태 필터
  if (filterStatus.value) {
    result = result.filter((p) => p.status === filterStatus.value)
  }

  // 검색 필터
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((p) => {
      if (searchType.value === 'title') {
        return p.title.toLowerCase().includes(keyword)
      } else if (searchType.value === 'content') {
        return p.content?.toLowerCase().includes(keyword)
      }
      // 전체 검색
      return (
        p.title.toLowerCase().includes(keyword) ||
        p.content?.toLowerCase().includes(keyword)
      )
    })
  }

  return result
})

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'info', label: '팝업정보' },
  { key: 'type', label: '종류' },
  { key: 'period', label: '노출기간' },
  { key: 'closeOption', label: '닫기설정' },
  { key: 'stats', label: '통계' },
  { key: 'status', label: '상태' },
]

// 벌크 선택
const selectedIds = ref([])

const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = paginatedPopups.value.map((p) => p.id)
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
  if (!confirm(`선택한 ${selectedIds.value.length}개의 팝업을 삭제하시겠습니까?`)) return

  popups.value = popups.value.filter((p) => !selectedIds.value.includes(p.id))
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: '선택한 팝업이 삭제되었습니다.',
  })
}

// 벌크 상태 변경
const bulkChangeStatus = (status) => {
  if (selectedIds.value.length === 0) return

  popups.value = popups.value.map((p) => {
    if (selectedIds.value.includes(p.id)) {
      return { ...p, status }
    }
    return p
  })
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: '상태가 변경되었습니다.',
  })
}

// 상태별 배지 색상
const getStatusBadge = (status) => {
  return statusOptions.find((s) => s.value === status) || statusOptions[3]
}

// 팝업 종류 라벨
const getTypeLabel = (type) => {
  return popupTypeOptions.find((t) => t.value === type)?.label || type
}

// 닫기 설정 라벨
const getCloseLabel = (option) => {
  return closeOptions.find((c) => c.value === option)?.label || option
}

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

// 노출 기간 포맷
const formatPeriod = (popup) => {
  const start = formatDate(popup.startDate)
  if (!popup.hasEndDate) return `${start} ~ 종료일 없음`
  return `${start} ~ ${formatDate(popup.endDate)}`
}

// 상세/편집 모달
const showDetailModal = ref(false)
const isEditMode = ref(false)
const selectedPopup = ref(null)

const editForm = ref({
  title: '',
  image: '',
  imageFile: null,
  imageInputType: 'file', // 'file' or 'url'
  type: 'layer',
  startDate: '',
  endDate: '',
  hasEndDate: true,
  closeOption: 'today',
  link: '',
  content: '',
  status: 'inactive',
})

// 이미지 파일 선택
const fileInputRef = ref(null)

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    editForm.value.imageFile = file
    // 미리보기 URL 생성
    editForm.value.image = URL.createObjectURL(file)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 팝업 상세 보기
const viewPopup = (popup) => {
  selectedPopup.value = popup
  editForm.value = {
    title: popup.title,
    image: popup.image,
    imageFile: null,
    imageInputType: 'file',
    type: popup.type,
    startDate: popup.startDate,
    endDate: popup.endDate || '',
    hasEndDate: popup.hasEndDate,
    closeOption: popup.closeOption,
    link: popup.link || '',
    content: popup.content,
    status: popup.status,
  }
  isEditMode.value = false
  showDetailModal.value = true
}

// 새 팝업 등록
const createPopup = () => {
  selectedPopup.value = null
  editForm.value = {
    title: '',
    image: '',
    imageFile: null,
    imageInputType: 'file',
    type: 'layer',
    startDate: '',
    endDate: '',
    hasEndDate: true,
    closeOption: 'today',
    link: '',
    content: '',
    status: 'inactive',
  }
  isEditMode.value = true
  showDetailModal.value = true
}

// 편집 모드 전환
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 저장
const savePopup = () => {
  if (selectedPopup.value) {
    // 수정
    const index = popups.value.findIndex((p) => p.id === selectedPopup.value.id)
    if (index > -1) {
      popups.value[index] = {
        ...popups.value[index],
        title: editForm.value.title,
        image: editForm.value.image,
        type: editForm.value.type,
        startDate: editForm.value.startDate,
        endDate: editForm.value.hasEndDate ? editForm.value.endDate : null,
        hasEndDate: editForm.value.hasEndDate,
        closeOption: editForm.value.closeOption,
        link: editForm.value.link,
        content: editForm.value.content,
        status: editForm.value.status,
      }
    }
    uiStore.showToast({
      type: 'success',
      message: '팝업이 수정되었습니다.',
    })
  } else {
    // 신규 등록
    const newPopup = {
      id: Date.now(),
      title: editForm.value.title,
      image: editForm.value.image,
      type: editForm.value.type,
      startDate: editForm.value.startDate,
      endDate: editForm.value.hasEndDate ? editForm.value.endDate : null,
      hasEndDate: editForm.value.hasEndDate,
      closeOption: editForm.value.closeOption,
      link: editForm.value.link,
      content: editForm.value.content,
      status: editForm.value.status,
      viewCount: 0,
      clickCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    popups.value.unshift(newPopup)
    uiStore.showToast({
      type: 'success',
      message: '팝업이 등록되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 삭제
const deletePopup = (popup) => {
  if (!confirm(`"${popup.title}" 팝업을 삭제하시겠습니까?`)) return

  const index = popups.value.findIndex((p) => p.id === popup.id)
  if (index > -1) {
    popups.value.splice(index, 1)
    uiStore.showToast({
      type: 'success',
      message: '팝업이 삭제되었습니다.',
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
  filterType.value = ''
  filterStatus.value = ''
  searchType.value = 'all'
  searchKeyword.value = ''
  currentPage.value = 1
}

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredPopups.value.length / perPage))
const paginatedPopups = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPopups.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="팝업 관리" description="사이트 팝업을 관리합니다.">
    <!-- Actions -->
    <template #actions>
      <UiButton variant="primary" @click="createPopup">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        팝업 등록
      </UiButton>
    </template>

    <!-- Filters -->
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterType"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">종류 전체</option>
            <option v-for="option in popupTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
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
            class="col-span-2 sm:col-span-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option v-for="option in searchTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="`${searchTypeOptions.find(o => o.value === searchType)?.label}(으)로 검색`"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <!-- Bulk Actions -->
    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="outline" size="sm" @click="bulkChangeStatus('active')">
          노출
        </UiButton>
        <UiButton variant="outline" size="sm" @click="bulkChangeStatus('inactive')">
          비활성
        </UiButton>
        <UiButton variant="danger" size="sm" @click="bulkDelete">
          삭제
        </UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- Popup List -->
    <DomainDataTable
      :columns="tableColumns"
      :items="paginatedPopups"
      :selected-ids="selectedIds"
      selectable
      empty-title="등록된 팝업이 없습니다"
      empty-description="새 팝업을 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="viewPopup"
    >
      <!-- 팝업정보 -->
      <template #cell-info="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-16 h-10 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
            <div class="w-full h-full flex items-center justify-center text-neutral-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-neutral-900 truncate">{{ item.title }}</p>
            <p class="text-xs text-neutral-500 truncate">{{ item.content }}</p>
          </div>
        </div>
      </template>

      <!-- 종류 -->
      <template #cell-type="{ item }">
        <span class="text-sm text-neutral-600">{{ getTypeLabel(item.type) }}</span>
      </template>

      <!-- 노출기간 -->
      <template #cell-period="{ item }">
        <div class="text-sm text-neutral-600">
          <p>{{ formatDate(item.startDate) }}</p>
          <p class="text-xs text-neutral-400">
            ~ {{ item.hasEndDate ? formatDate(item.endDate) : '종료일 없음' }}
          </p>
        </div>
      </template>

      <!-- 닫기설정 -->
      <template #cell-closeOption="{ item }">
        <span class="text-sm text-neutral-600">{{ getCloseLabel(item.closeOption) }}</span>
      </template>

      <!-- 통계 -->
      <template #cell-stats="{ item }">
        <div class="text-sm text-neutral-600">
          <p>노출 {{ item.viewCount.toLocaleString() }}</p>
          <p class="text-xs text-neutral-400">클릭 {{ item.clickCount.toLocaleString() }}</p>
        </div>
      </template>

      <!-- 상태 -->
      <template #cell-status="{ item }">
        <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
          {{ getStatusBadge(item.status).label }}
        </UiBadge>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex items-center gap-2 mb-1">
          <p class="text-sm font-medium text-neutral-900 truncate flex-1">{{ item.title }}</p>
          <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
            {{ getStatusBadge(item.status).label }}
          </UiBadge>
        </div>
        <p class="text-xs text-neutral-500 mb-2 truncate">{{ item.content }}</p>
        <div class="flex items-center gap-4 text-xs text-neutral-400">
          <span>{{ getTypeLabel(item.type) }}</span>
          <span>{{ formatPeriod(item) }}</span>
        </div>
      </template>
    </DomainDataTable>

    <!-- Pagination -->
    <template #pagination>
      <UiPagination
        v-model:currentPage="currentPage"
        :total-pages="totalPages"
        :total-items="filteredPopups.length"
        :per-page="perPage"
      />
    </template>

    <!-- Detail/Edit Modal -->
    <UiModal
      v-model="showDetailModal"
      :title="selectedPopup ? (isEditMode ? '팝업 수정' : '팝업 상세') : '팝업 등록'"
      size="lg"
    >
      <div class="space-y-5">
        <!-- 상태 -->
        <div v-if="isEditMode">
          <label class="block text-sm font-medium text-neutral-700 mb-2">상태</label>
          <div class="flex flex-wrap gap-3">
            <label
              v-for="option in statusOptions"
              :key="option.value"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                v-model="editForm.status"
                type="radio"
                :value="option.value"
                class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              >
              <span class="text-sm text-neutral-700">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- 제목 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">제목</label>
          <input
            v-if="isEditMode"
            v-model="editForm.title"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="팝업 제목을 입력하세요"
          >
          <p v-else class="text-sm text-neutral-900">{{ editForm.title }}</p>
        </div>

        <!-- 이미지 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">이미지</label>
          <div v-if="isEditMode" class="space-y-3">
            <!-- 이미지 입력 방식 선택 -->
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="editForm.imageInputType"
                  type="radio"
                  value="file"
                  class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                >
                <span class="text-sm text-neutral-700">파일 업로드</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="editForm.imageInputType"
                  type="radio"
                  value="url"
                  class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                >
                <span class="text-sm text-neutral-700">URL 입력</span>
              </label>
            </div>

            <!-- 파일 업로드 -->
            <div v-if="editForm.imageInputType === 'file'">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              >
              <div
                class="w-full h-40 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 cursor-pointer transition-colors flex items-center justify-center"
                @click="triggerFileInput"
              >
                <div v-if="editForm.image && editForm.imageInputType === 'file'" class="relative w-full h-full">
                  <img
                    :src="editForm.image"
                    alt="미리보기"
                    class="w-full h-full object-contain rounded-lg"
                  >
                  <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span class="text-white text-sm">클릭하여 변경</span>
                  </div>
                </div>
                <div v-else class="text-center">
                  <svg class="w-10 h-10 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm text-neutral-500">클릭하여 이미지 선택</p>
                  <p class="text-xs text-neutral-400 mt-1">권장 사이즈: 720x480px</p>
                </div>
              </div>
            </div>

            <!-- URL 입력 -->
            <div v-else>
              <input
                v-model="editForm.image"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://example.com/image.jpg"
              >
              <div v-if="editForm.image" class="mt-2 w-full h-40 bg-neutral-50 rounded-lg overflow-hidden">
                <img
                  :src="editForm.image"
                  alt="미리보기"
                  class="w-full h-full object-contain"
                  @error="(e) => e.target.style.display = 'none'"
                >
              </div>
            </div>
          </div>
          <div v-else class="w-full h-40 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- 팝업 종류 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">팝업 종류</label>
          <div v-if="isEditMode" class="grid grid-cols-2 gap-3">
            <label
              v-for="option in popupTypeOptions"
              :key="option.value"
              :class="[
                'flex flex-col p-3 border rounded-lg cursor-pointer transition-colors',
                editForm.type === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300',
              ]"
            >
              <div class="flex items-center gap-2">
                <input
                  v-model="editForm.type"
                  type="radio"
                  :value="option.value"
                  class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                >
                <span class="text-sm font-medium text-neutral-900">{{ option.label }}</span>
              </div>
              <p class="text-xs text-neutral-500 mt-1 ml-6">{{ option.description }}</p>
            </label>
          </div>
          <p v-else class="text-sm text-neutral-900">{{ getTypeLabel(editForm.type) }}</p>
        </div>

        <!-- 노출 기간 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">노출 기간</label>
          <div v-if="isEditMode" class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">시작일</label>
                <input
                  v-model="editForm.startDate"
                  type="date"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">종료일</label>
                <input
                  v-model="editForm.endDate"
                  type="date"
                  :disabled="!editForm.hasEndDate"
                  :class="[
                    'w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
                    !editForm.hasEndDate ? 'bg-neutral-100 text-neutral-400' : '',
                  ]"
                >
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="editForm.hasEndDate"
                type="checkbox"
                :value="false"
                :checked="!editForm.hasEndDate"
                class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                @change="editForm.hasEndDate = !$event.target.checked"
              >
              <span class="text-sm text-neutral-700">종료일 없음 (상시 노출)</span>
            </label>
          </div>
          <p v-else class="text-sm text-neutral-900">
            {{ formatDate(editForm.startDate) }} ~ {{ editForm.hasEndDate ? formatDate(editForm.endDate) : '종료일 없음' }}
          </p>
        </div>

        <!-- 닫기 설정 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">닫기 설정</label>
          <div v-if="isEditMode" class="flex flex-wrap gap-3">
            <label
              v-for="option in closeOptions"
              :key="option.value"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                v-model="editForm.closeOption"
                type="radio"
                :value="option.value"
                class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
              >
              <span class="text-sm text-neutral-700">{{ option.label }}</span>
            </label>
          </div>
          <p v-else class="text-sm text-neutral-900">{{ getCloseLabel(editForm.closeOption) }}</p>
        </div>

        <!-- 링크 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">연결 링크 (선택)</label>
          <input
            v-if="isEditMode"
            v-model="editForm.link"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="/event/page 또는 https://..."
          >
          <p v-else class="text-sm text-neutral-900">{{ editForm.link || '-' }}</p>
        </div>

        <!-- 내용 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">내용</label>
          <textarea
            v-if="isEditMode"
            v-model="editForm.content"
            rows="4"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="팝업 내용을 입력하세요"
          />
          <p v-else class="text-sm text-neutral-900 whitespace-pre-wrap">{{ editForm.content }}</p>
        </div>

        <!-- 통계 (상세보기에서만) -->
        <div v-if="selectedPopup && !isEditMode" class="pt-4 border-t border-neutral-200">
          <h4 class="text-sm font-medium text-neutral-700 mb-2">통계</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-neutral-50 p-3 rounded-lg">
              <p class="text-xs text-neutral-500">노출수</p>
              <p class="text-lg font-semibold text-neutral-900">{{ selectedPopup.viewCount.toLocaleString() }}</p>
            </div>
            <div class="bg-neutral-50 p-3 rounded-lg">
              <p class="text-xs text-neutral-500">클릭수</p>
              <p class="text-lg font-semibold text-neutral-900">{{ selectedPopup.clickCount.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <UiButton
              v-if="selectedPopup && !isEditMode"
              variant="danger"
              @click="deletePopup(selectedPopup)"
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
              v-if="!isEditMode && selectedPopup"
              variant="secondary"
              @click="toggleEditMode"
            >
              수정
            </UiButton>
            <UiButton
              v-if="isEditMode"
              variant="primary"
              @click="savePopup"
            >
              저장
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
