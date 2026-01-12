<script setup>
/**
 * 팝업 등록/수정 페이지
 * - /admin/contents/popups/new → 등록 모드
 * - /admin/contents/popups/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')

const typeOptions = [
  { value: 'layer', label: '레이어 모달', description: '화면 중앙에 모달로 표시' },
  { value: 'fullscreen', label: '풀스크린', description: '전체 화면으로 표시' },
]

const closeOptions = [
  { value: 'today', label: '오늘 하루 보지 않기' },
  { value: 'week', label: '일주일간 보지 않기' },
  { value: 'month', label: '한달간 보지 않기' },
]

const statusOptions = [
  { value: 'active', label: '노출중' },
  { value: 'scheduled', label: '예약' },
  { value: 'inactive', label: '비활성' },
]

const form = ref({
  title: '',
  content: '',
  image: '',
  imageInputType: 'file',
  type: 'layer',
  startDate: '',
  endDate: '',
  hasEndDate: true,
  closeOption: 'today',
  link: '',
  status: 'inactive',
  viewCount: 0,
  clickCount: 0,
})

const isLoading = ref(false)
const isSaving = ref(false)
const fileInputRef = ref(null)

const fetchPopup = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock 데이터
  form.value = {
    title: '신년 이벤트 안내',
    content: '2025년 신년 이벤트에 참여하세요!',
    image: '/images/popup/newyear.jpg',
    imageInputType: 'file',
    type: 'layer',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    hasEndDate: true,
    closeOption: 'today',
    link: '/event/newyear',
    status: 'active',
    viewCount: 1250,
    clickCount: 340,
  }

  isLoading.value = false
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) form.value.image = URL.createObjectURL(file)
}

const triggerFileInput = () => fileInputRef.value?.click()

const handleSave = async () => {
  if (!form.value.title) {
    uiStore.showToast({ type: 'error', message: '제목을 입력해주세요.' })
    return
  }

  isSaving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  uiStore.showToast({
    type: 'success',
    message: isEditMode.value ? '팝업이 수정되었습니다.' : '팝업이 등록되었습니다.',
  })
  router.push('/admin/contents/popups')
}

const handleDelete = async () => {
  if (!confirm('이 팝업을 삭제하시겠습니까?')) return
  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '팝업이 삭제되었습니다.' })
  router.push('/admin/contents/popups')
}

const handleCancel = () => router.back()

onMounted(() => {
  if (isEditMode.value) {
    fetchPopup()
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? '팝업 수정' : '팝업 등록'"
    :description="isEditMode ? '팝업 정보를 수정합니다.' : '새 팝업을 등록합니다.'"
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
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">제목 <span class="text-error-500">*</span></label>
            <input v-model="form.title" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="팝업 제목">
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">내용</label>
            <textarea v-model="form.content" rows="3" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="팝업에 표시될 내용" />
          </div>

          <!-- 이미지 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">이미지</label>
            <div class="flex gap-4 mb-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.imageInputType" type="radio" value="file" class="w-4 h-4 text-primary-600">
                <span class="text-sm text-neutral-700">파일 업로드</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.imageInputType" type="radio" value="url" class="w-4 h-4 text-primary-600">
                <span class="text-sm text-neutral-700">URL 입력</span>
              </label>
            </div>

            <div v-if="form.imageInputType === 'file'">
              <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelect">
              <div class="w-full h-40 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 cursor-pointer transition-colors flex items-center justify-center" @click="triggerFileInput">
                <div v-if="form.image" class="relative w-full h-full">
                  <img :src="form.image" alt="미리보기" class="w-full h-full object-contain rounded-lg">
                </div>
                <div v-else class="text-center">
                  <svg class="w-10 h-10 mx-auto mb-2 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm text-neutral-500">클릭하여 이미지 선택</p>
                </div>
              </div>
            </div>
            <div v-else>
              <input v-model="form.image" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" placeholder="https://example.com/image.jpg">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">연결 링크</label>
            <input v-model="form.link" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="/event/sale 또는 https://...">
          </div>
        </div>
      </UiCard>

      <!-- 팝업 설정 -->
      <UiCard title="팝업 설정">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">팝업 종류</label>
            <div class="flex flex-wrap gap-2">
              <label v-for="opt in typeOptions" :key="opt.value" :class="['px-4 py-3 border rounded-lg cursor-pointer transition-colors', form.type === opt.value ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300']">
                <input v-model="form.type" type="radio" :value="opt.value" class="sr-only">
                <p class="text-sm font-medium" :class="form.type === opt.value ? 'text-primary-700' : 'text-neutral-900'">{{ opt.label }}</p>
                <p class="text-xs" :class="form.type === opt.value ? 'text-primary-600' : 'text-neutral-500'">{{ opt.description }}</p>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">닫기 옵션</label>
            <select v-model="form.closeOption" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option v-for="opt in closeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">노출 기간</label>
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">시작일</label>
                <input v-model="form.startDate" type="date" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm">
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">종료일</label>
                <input v-model="form.endDate" type="date" :disabled="!form.hasEndDate" :class="['w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm', !form.hasEndDate ? 'bg-neutral-100' : '']">
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="!form.hasEndDate" class="w-4 h-4 text-primary-600 rounded" @change="form.hasEndDate = !$event.target.checked">
              <span class="text-sm text-neutral-700">종료일 없음</span>
            </label>
          </div>
        </div>
      </UiCard>

      <!-- 통계 (수정 모드에서만) -->
      <UiCard v-if="isEditMode" title="통계">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-neutral-50 p-4 rounded-lg">
            <p class="text-xs text-neutral-500 mb-1">노출수</p>
            <p class="text-2xl font-bold text-neutral-900">{{ form.viewCount.toLocaleString() }}</p>
          </div>
          <div class="bg-neutral-50 p-4 rounded-lg">
            <p class="text-xs text-neutral-500 mb-1">클릭수</p>
            <p class="text-2xl font-bold text-neutral-900">{{ form.clickCount.toLocaleString() }}</p>
          </div>
        </div>
      </UiCard>
    </div>
  </LayoutFormPage>
</template>
