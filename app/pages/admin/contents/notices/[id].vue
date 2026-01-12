<script setup>
/**
 * 공지사항 등록/수정 페이지
 * - /admin/contents/notices/new → 등록 모드
 * - /admin/contents/notices/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')

const categoryOptions = [
  { value: 'general', label: '일반' },
  { value: 'event', label: '이벤트' },
  { value: 'system', label: '시스템' },
  { value: 'shipping', label: '배송' },
]

const form = ref({
  title: '',
  content: '',
  category: 'general',
  isPinned: false,
  status: 'draft',
  viewCount: 0,
})

const isLoading = ref(false)
const isSaving = ref(false)

const fetchNotice = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  form.value = {
    title: '2025년 신년 운영 안내',
    content: '안녕하세요. 2025년 새해가 밝았습니다.\n\n신년을 맞이하여 운영 일정을 안내드립니다.\n\n감사합니다.',
    category: 'general',
    isPinned: true,
    status: 'published',
    viewCount: 1520,
  }
  isLoading.value = false
}

const handleSave = async () => {
  if (!form.value.title) {
    uiStore.showToast({ type: 'error', message: '제목을 입력해주세요.' })
    return
  }
  isSaving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  uiStore.showToast({
    type: 'success',
    message: isEditMode.value ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.',
  })
  router.push('/admin/contents/notices')
}

const handleDelete = async () => {
  if (!confirm('이 공지사항을 삭제하시겠습니까?')) return
  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
  router.push('/admin/contents/notices')
}

const handleCancel = () => router.back()

onMounted(() => {
  if (isEditMode.value) {
    fetchNotice()
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? '공지사항 수정' : '공지사항 등록'"
    :description="isEditMode ? '공지사항을 수정합니다.' : '새 공지사항을 등록합니다.'"
    :is-saving="isSaving"
    show-cancel
    @save="handleSave"
    @cancel="handleCancel"
  >
    <template v-if="isEditMode" #footer-left>
      <UiButton variant="danger" :disabled="isSaving" @click="handleDelete">삭제</UiButton>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center py-20"><UiSpinner size="lg" /></div>

    <div v-else class="space-y-6">
      <UiCard title="상태">
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.status" type="radio" value="published" class="w-4 h-4 text-primary-600">
            <span class="text-sm text-neutral-700">게시</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.status" type="radio" value="draft" class="w-4 h-4 text-primary-600">
            <span class="text-sm text-neutral-700">임시저장</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer ml-auto">
            <input v-model="form.isPinned" type="checkbox" class="w-4 h-4 text-primary-600 rounded">
            <span class="text-sm text-neutral-700">상단 고정</span>
          </label>
        </div>
      </UiCard>

      <UiCard title="기본 정보">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">분류</label>
            <select v-model="form.category" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">제목 <span class="text-error-500">*</span></label>
            <input v-model="form.title" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="공지 제목">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">내용</label>
            <textarea v-model="form.content" rows="10" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="공지 내용을 입력하세요" />
          </div>
        </div>
      </UiCard>

      <!-- 통계 (수정 모드에서만) -->
      <UiCard v-if="isEditMode" title="통계">
        <div class="bg-neutral-50 p-4 rounded-lg">
          <p class="text-xs text-neutral-500 mb-1">조회수</p>
          <p class="text-2xl font-bold text-neutral-900">{{ form.viewCount.toLocaleString() }}</p>
        </div>
      </UiCard>
    </div>
  </LayoutFormPage>
</template>
