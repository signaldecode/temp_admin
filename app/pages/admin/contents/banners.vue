<script setup>
/**
 * 배너 관리 페이지
 * - 배너 목록 및 설정
 * - 위치별 배너 관리
 * - 노출 순서, 기간, 링크 설정
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 배너 위치 옵션
const positionOptions = [
  { value: 'main_top', label: '메인 상단' },
  { value: 'main_middle', label: '메인 중단' },
  { value: 'main_bottom', label: '메인 하단' },
  { value: 'category', label: '카테고리 페이지' },
  { value: 'product', label: '상품 상세' },
]

// 상태 옵션
const statusOptions = [
  { value: 'active', label: '노출중', color: 'success' },
  { value: 'scheduled', label: '예약', color: 'info' },
  { value: 'ended', label: '종료', color: 'neutral' },
  { value: 'inactive', label: '비활성', color: 'warning' },
]

// Mock 배너 데이터
const banners = ref([
  {
    id: 1,
    title: '신년 세일 배너',
    image: '/images/banner/newyear.jpg',
    position: 'main_top',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    hasEndDate: true,
    link: '/sale/newyear',
    order: 1,
    clickCount: 2450,
    createdAt: '2024-12-28',
  },
  {
    id: 2,
    title: '겨울 신상품',
    image: '/images/banner/winter.jpg',
    position: 'main_top',
    status: 'active',
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    hasEndDate: true,
    link: '/category/winter',
    order: 2,
    clickCount: 1890,
    createdAt: '2024-11-28',
  },
  {
    id: 3,
    title: '회원가입 이벤트',
    image: '/images/banner/signup.jpg',
    position: 'main_middle',
    status: 'active',
    startDate: '2025-01-01',
    endDate: null,
    hasEndDate: false,
    link: '/event/signup',
    order: 1,
    clickCount: 560,
    createdAt: '2025-01-01',
  },
  {
    id: 4,
    title: '앱 다운로드',
    image: '/images/banner/app.jpg',
    position: 'main_bottom',
    status: 'active',
    startDate: '2024-01-01',
    endDate: null,
    hasEndDate: false,
    link: '/download',
    order: 1,
    clickCount: 890,
    createdAt: '2024-01-01',
  },
  {
    id: 5,
    title: '설 연휴 기획전',
    image: '/images/banner/seol.jpg',
    position: 'main_top',
    status: 'scheduled',
    startDate: '2025-01-20',
    endDate: '2025-02-05',
    hasEndDate: true,
    link: '/event/seol',
    order: 3,
    clickCount: 0,
    createdAt: '2025-01-06',
  },
])

// 필터
const filterPosition = ref('')
const filterStatus = ref('')
const searchType = ref('all')
const searchKeyword = ref('')

// 검색 타입 옵션
const searchTypeOptions = [
  { value: 'all', label: '전체' },
  { value: 'title', label: '제목' },
  { value: 'link', label: '링크' },
]

// 필터링된 배너
const filteredBanners = computed(() => {
  let result = [...banners.value]

  // 위치 필터
  if (filterPosition.value) {
    result = result.filter((b) => b.position === filterPosition.value)
  }

  // 상태 필터
  if (filterStatus.value) {
    result = result.filter((b) => b.status === filterStatus.value)
  }

  // 검색 필터
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((b) => {
      if (searchType.value === 'title') {
        return b.title.toLowerCase().includes(keyword)
      } else if (searchType.value === 'link') {
        return b.link?.toLowerCase().includes(keyword)
      }
      // 전체 검색
      return (
        b.title.toLowerCase().includes(keyword) ||
        b.link?.toLowerCase().includes(keyword)
      )
    })
  }

  return result.sort((a, b) => a.order - b.order)
})

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'order', label: '순서', width: 'w-12' },
  { key: 'info', label: '배너정보' },
  { key: 'position', label: '위치' },
  { key: 'period', label: '노출기간' },
  { key: 'clickCount', label: '클릭수' },
  { key: 'status', label: '상태' },
]

// 벌크 선택
const selectedIds = ref([])

const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = paginatedBanners.value.map((b) => b.id)
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
  if (!confirm(`선택한 ${selectedIds.value.length}개의 배너를 삭제하시겠습니까?`)) return

  banners.value = banners.value.filter((b) => !selectedIds.value.includes(b.id))
  selectedIds.value = []
  uiStore.showToast({
    type: 'success',
    message: '선택한 배너가 삭제되었습니다.',
  })
}

// 벌크 상태 변경
const bulkChangeStatus = (status) => {
  if (selectedIds.value.length === 0) return

  banners.value = banners.value.map((b) => {
    if (selectedIds.value.includes(b.id)) {
      return { ...b, status }
    }
    return b
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

// 위치 라벨
const getPositionLabel = (position) => {
  return positionOptions.find((p) => p.value === position)?.label || position
}

// 날짜 포맷
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

// 노출 기간 포맷
const formatPeriod = (banner) => {
  const start = formatDate(banner.startDate)
  if (!banner.hasEndDate) return `${start} ~ 종료일 없음`
  return `${start} ~ ${formatDate(banner.endDate)}`
}

// 상세/편집 모달
const showDetailModal = ref(false)
const isEditMode = ref(false)
const selectedBanner = ref(null)

const editForm = ref({
  title: '',
  image: '',
  imageFile: null,
  imageInputType: 'file',
  position: 'main_top',
  startDate: '',
  endDate: '',
  hasEndDate: true,
  link: '',
  order: 1,
  status: 'inactive',
})

// 이미지 파일 선택
const fileInputRef = ref(null)

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    editForm.value.imageFile = file
    editForm.value.image = URL.createObjectURL(file)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 배너 상세 보기
const viewBanner = (banner) => {
  selectedBanner.value = banner
  editForm.value = {
    title: banner.title,
    image: banner.image,
    imageFile: null,
    imageInputType: 'file',
    position: banner.position,
    startDate: banner.startDate,
    endDate: banner.endDate || '',
    hasEndDate: banner.hasEndDate,
    link: banner.link || '',
    order: banner.order,
    status: banner.status,
  }
  isEditMode.value = false
  showDetailModal.value = true
}

// 새 배너 등록
const createBanner = () => {
  selectedBanner.value = null
  editForm.value = {
    title: '',
    image: '',
    imageFile: null,
    imageInputType: 'file',
    position: 'main_top',
    startDate: '',
    endDate: '',
    hasEndDate: true,
    link: '',
    order: 1,
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
const saveBanner = () => {
  if (selectedBanner.value) {
    const index = banners.value.findIndex((b) => b.id === selectedBanner.value.id)
    if (index > -1) {
      banners.value[index] = {
        ...banners.value[index],
        title: editForm.value.title,
        image: editForm.value.image,
        position: editForm.value.position,
        startDate: editForm.value.startDate,
        endDate: editForm.value.hasEndDate ? editForm.value.endDate : null,
        hasEndDate: editForm.value.hasEndDate,
        link: editForm.value.link,
        order: editForm.value.order,
        status: editForm.value.status,
      }
    }
    uiStore.showToast({
      type: 'success',
      message: '배너가 수정되었습니다.',
    })
  } else {
    const newBanner = {
      id: Date.now(),
      title: editForm.value.title,
      image: editForm.value.image,
      position: editForm.value.position,
      startDate: editForm.value.startDate,
      endDate: editForm.value.hasEndDate ? editForm.value.endDate : null,
      hasEndDate: editForm.value.hasEndDate,
      link: editForm.value.link,
      order: editForm.value.order,
      status: editForm.value.status,
      clickCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    banners.value.push(newBanner)
    uiStore.showToast({
      type: 'success',
      message: '배너가 등록되었습니다.',
    })
  }
  showDetailModal.value = false
}

// 삭제
const deleteBanner = (banner) => {
  if (!confirm(`"${banner.title}" 배너를 삭제하시겠습니까?`)) return

  const index = banners.value.findIndex((b) => b.id === banner.id)
  if (index > -1) {
    banners.value.splice(index, 1)
    uiStore.showToast({
      type: 'success',
      message: '배너가 삭제되었습니다.',
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
  filterPosition.value = ''
  filterStatus.value = ''
  searchType.value = 'all'
  searchKeyword.value = ''
  currentPage.value = 1
}

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredBanners.value.length / perPage))
const paginatedBanners = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredBanners.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="배너 관리" description="사이트 배너를 관리합니다.">
    <!-- Actions -->
    <template #actions>
      <UiButton variant="primary" @click="createBanner">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        배너 등록
      </UiButton>
    </template>

    <!-- Filters -->
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterPosition"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">위치 전체</option>
            <option v-for="option in positionOptions" :key="option.value" :value="option.value">
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

    <!-- Banner List (Main Content) -->
    <DomainDataTable
      :columns="tableColumns"
      :items="paginatedBanners"
      :selected-ids="selectedIds"
      selectable
      empty-title="등록된 배너가 없습니다"
      empty-description="새 배너를 등록해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="viewBanner"
    >
      <!-- 순서 -->
      <template #cell-order="{ item }">
        <span class="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">
          {{ item.order }}
        </span>
      </template>

      <!-- 배너정보 -->
      <template #cell-info="{ item }">
        <div class="flex items-center gap-3">
          <div class="w-24 h-14 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
            <div class="w-full h-full flex items-center justify-center text-neutral-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-neutral-900 truncate">{{ item.title }}</p>
            <p v-if="item.link" class="text-xs text-neutral-400 truncate">{{ item.link }}</p>
          </div>
        </div>
      </template>

      <!-- 위치 -->
      <template #cell-position="{ item }">
        <span class="text-sm text-neutral-600">{{ getPositionLabel(item.position) }}</span>
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

      <!-- 클릭수 -->
      <template #cell-clickCount="{ item }">
        <span class="text-sm text-neutral-600">{{ item.clickCount.toLocaleString() }}</span>
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
          <span class="w-5 h-5 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">
            {{ item.order }}
          </span>
          <p class="text-sm font-medium text-neutral-900 truncate flex-1">{{ item.title }}</p>
          <UiBadge :variant="getStatusBadge(item.status).color" size="sm">
            {{ getStatusBadge(item.status).label }}
          </UiBadge>
        </div>
        <div class="flex items-center gap-4 text-xs text-neutral-400">
          <span>{{ getPositionLabel(item.position) }}</span>
          <span>{{ formatPeriod(item) }}</span>
        </div>
      </template>
    </DomainDataTable>

    <!-- Pagination -->
    <template #pagination>
      <UiPagination
        v-model:currentPage="currentPage"
        :total-pages="totalPages"
        :total-items="filteredBanners.length"
        :per-page="perPage"
      />
    </template>

    <!-- Detail/Edit Modal -->
    <UiModal
      v-model="showDetailModal"
      :title="selectedBanner ? (isEditMode ? '배너 수정' : '배너 상세') : '배너 등록'"
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
            placeholder="배너 제목을 입력하세요"
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
                class="w-full h-32 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 cursor-pointer transition-colors flex items-center justify-center"
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
                  <p class="text-xs text-neutral-400 mt-1">권장 사이즈: 1920x600px</p>
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
              <div v-if="editForm.image" class="mt-2 w-full h-32 bg-neutral-50 rounded-lg overflow-hidden">
                <img
                  :src="editForm.image"
                  alt="미리보기"
                  class="w-full h-full object-contain"
                  @error="(e) => e.target.style.display = 'none'"
                >
              </div>
            </div>
          </div>
          <div v-else class="w-full h-32 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- 배너 위치 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">배너 위치</label>
          <div v-if="isEditMode" class="flex flex-wrap gap-2">
            <label
              v-for="option in positionOptions"
              :key="option.value"
              :class="[
                'px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors',
                editForm.position === option.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
              ]"
            >
              <input
                v-model="editForm.position"
                type="radio"
                :value="option.value"
                class="sr-only"
              >
              {{ option.label }}
            </label>
          </div>
          <p v-else class="text-sm text-neutral-900">{{ getPositionLabel(editForm.position) }}</p>
        </div>

        <!-- 노출 순서 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">노출 순서</label>
          <input
            v-if="isEditMode"
            v-model.number="editForm.order"
            type="number"
            min="1"
            class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
          <p v-else class="text-sm text-neutral-900">{{ editForm.order }}</p>
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
                type="checkbox"
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

        <!-- 링크 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">연결 링크</label>
          <input
            v-if="isEditMode"
            v-model="editForm.link"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="/sale/event 또는 https://..."
          >
          <p v-else class="text-sm text-neutral-900">{{ editForm.link || '-' }}</p>
        </div>

        <!-- 통계 -->
        <div v-if="selectedBanner && !isEditMode" class="pt-4 border-t border-neutral-200">
          <h4 class="text-sm font-medium text-neutral-700 mb-2">통계</h4>
          <div class="bg-neutral-50 p-3 rounded-lg">
            <p class="text-xs text-neutral-500">클릭수</p>
            <p class="text-lg font-semibold text-neutral-900">{{ selectedBanner.clickCount.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <UiButton
              v-if="selectedBanner && !isEditMode"
              variant="danger"
              @click="deleteBanner(selectedBanner)"
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
              v-if="!isEditMode && selectedBanner"
              variant="secondary"
              @click="toggleEditMode"
            >
              수정
            </UiButton>
            <UiButton
              v-if="isEditMode"
              variant="primary"
              @click="saveBanner"
            >
              저장
            </UiButton>
          </div>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
