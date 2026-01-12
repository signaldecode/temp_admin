<script setup>
/**
 * 배너 등록/수정 페이지
 * - /admin/contents/banners/new → 등록 모드
 * - /admin/contents/banners/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')

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
  { value: 'active', label: '노출중' },
  { value: 'scheduled', label: '예약' },
  { value: 'inactive', label: '비활성' },
]

// 폼 데이터
const form = ref({
  title: '',
  image: '',
  imageInputType: 'file',
  position: 'main_top',
  startDate: '',
  endDate: '',
  hasEndDate: true,
  link: '',
  order: 1,
  status: 'inactive',
  clickCount: 0,
})

const isLoading = ref(false)
const isSaving = ref(false)

// 데이터 로드 (수정 모드에서만)
const fetchBanner = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock 데이터
  form.value = {
    title: '신년 세일 배너',
    image: '/images/banner/newyear.jpg',
    imageInputType: 'file',
    position: 'main_top',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    hasEndDate: true,
    link: '/sale/newyear',
    order: 1,
    clickCount: 2450,
  }

  isLoading.value = false
}

// 이미지 파일 선택
const fileInputRef = ref(null)

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    form.value.image = URL.createObjectURL(file)
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 저장
const handleSave = async () => {
  if (!form.value.title) {
    uiStore.showToast({ type: 'error', message: '제목을 입력해주세요.' })
    return
  }

  isSaving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log(isEditMode.value ? '수정 데이터:' : '등록 데이터:', form.value)
  uiStore.showToast({
    type: 'success',
    message: isEditMode.value ? '배너가 수정되었습니다.' : '배너가 등록되었습니다.',
  })
  router.push('/admin/contents/banners')
}

// 삭제 (수정 모드에서만)
const handleDelete = async () => {
  if (!confirm('이 배너를 삭제하시겠습니까?')) return

  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '배너가 삭제되었습니다.' })
  router.push('/admin/contents/banners')
}

const handleCancel = () => router.back()

onMounted(() => {
  if (isEditMode.value) {
    fetchBanner()
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? '배너 수정' : '배너 등록'"
    :description="isEditMode ? '배너 정보를 수정합니다.' : '새 배너를 등록합니다.'"
    :is-saving="isSaving"
    show-cancel
    @save="handleSave"
    @cancel="handleCancel"
  >
    <template v-if="isEditMode" #footer-left>
      <UiButton variant="danger" :disabled="isSaving" @click="handleDelete">삭제</UiButton>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- 상태 -->
      <UiCard title="상태">
        <div class="flex flex-wrap gap-3">
          <label v-for="opt in statusOptions" :key="opt.value" class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.status" type="radio" :value="opt.value" class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500">
            <span class="text-sm text-neutral-700">{{ opt.label }}</span>
          </label>
        </div>
      </UiCard>

      <!-- 기본 정보 -->
      <UiCard title="기본 정보">
        <div class="space-y-4">
          <!-- 제목 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">제목 <span class="text-error-500">*</span></label>
            <input
              v-model="form.title"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="배너 제목을 입력하세요"
            >
          </div>

          <!-- 이미지 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">이미지</label>
            <div class="flex gap-4 mb-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.imageInputType" type="radio" value="file" class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500">
                <span class="text-sm text-neutral-700">파일 업로드</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.imageInputType" type="radio" value="url" class="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500">
                <span class="text-sm text-neutral-700">URL 입력</span>
              </label>
            </div>

            <!-- 파일 업로드 -->
            <div v-if="form.imageInputType === 'file'">
              <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelect">
              <div
                class="w-full h-40 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 cursor-pointer transition-colors flex items-center justify-center"
                @click="triggerFileInput"
              >
                <div v-if="form.image" class="relative w-full h-full">
                  <img :src="form.image" alt="미리보기" class="w-full h-full object-contain rounded-lg">
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
              <input v-model="form.image" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://example.com/image.jpg">
              <div v-if="form.image" class="mt-2 w-full h-40 bg-neutral-50 rounded-lg overflow-hidden">
                <img :src="form.image" alt="미리보기" class="w-full h-full object-contain">
              </div>
            </div>
          </div>

          <!-- 연결 링크 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">연결 링크</label>
            <input v-model="form.link" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="/sale/event 또는 https://...">
          </div>
        </div>
      </UiCard>

      <!-- 배너 설정 -->
      <UiCard title="배너 설정">
        <div class="space-y-4">
          <!-- 배너 위치 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">배너 위치</label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="opt in positionOptions"
                :key="opt.value"
                :class="[
                  'px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors',
                  form.position === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.position" type="radio" :value="opt.value" class="sr-only">
                {{ opt.label }}
              </label>
            </div>
          </div>

          <!-- 노출 순서 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">노출 순서</label>
            <input v-model.number="form.order" type="number" min="1" class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          </div>

          <!-- 노출 기간 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">노출 기간</label>
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">시작일</label>
                <input v-model="form.startDate" type="date" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">종료일</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  :disabled="!form.hasEndDate"
                  :class="['w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500', !form.hasEndDate ? 'bg-neutral-100 text-neutral-400' : '']"
                >
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="!form.hasEndDate" class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500" @change="form.hasEndDate = !$event.target.checked">
              <span class="text-sm text-neutral-700">종료일 없음 (상시 노출)</span>
            </label>
          </div>
        </div>
      </UiCard>

      <!-- 통계 (수정 모드에서만) -->
      <UiCard v-if="isEditMode" title="통계">
        <div class="bg-neutral-50 p-4 rounded-lg">
          <p class="text-xs text-neutral-500 mb-1">클릭수</p>
          <p class="text-2xl font-bold text-neutral-900">{{ form.clickCount.toLocaleString() }}</p>
        </div>
      </UiCard>
    </div>
  </LayoutFormPage>
</template>
