<script setup>
/**
 * FAQ 등록/수정 페이지
 * - /admin/contents/faq/new → 등록 모드
 * - /admin/contents/faq/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')

const categoryOptions = [
  { value: 'order', label: '주문/결제' },
  { value: 'shipping', label: '배송' },
  { value: 'return', label: '교환/반품' },
  { value: 'member', label: '회원' },
  { value: 'etc', label: '기타' },
]

const form = ref({
  question: '',
  answer: '',
  category: 'order',
  order: 1,
})

const isLoading = ref(false)
const isSaving = ref(false)

const fetchFaq = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  form.value = {
    question: '배송비는 얼마인가요?',
    answer: '기본 배송비는 3,000원이며, 50,000원 이상 구매 시 무료배송입니다.\n\n제주 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.',
    category: 'shipping',
    order: 1,
  }
  isLoading.value = false
}

const handleSave = async () => {
  if (!form.value.question) {
    uiStore.showToast({ type: 'error', message: '질문을 입력해주세요.' })
    return
  }
  isSaving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))

  uiStore.showToast({
    type: 'success',
    message: isEditMode.value ? 'FAQ가 수정되었습니다.' : 'FAQ가 등록되었습니다.',
  })
  router.push('/admin/contents/faq')
}

const handleDelete = async () => {
  if (!confirm('이 FAQ를 삭제하시겠습니까?')) return
  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
  router.push('/admin/contents/faq')
}

const handleCancel = () => router.back()

onMounted(() => {
  if (isEditMode.value) {
    fetchFaq()
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? 'FAQ 수정' : 'FAQ 등록'"
    :description="isEditMode ? 'FAQ를 수정합니다.' : '새 FAQ를 등록합니다.'"
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
      <UiCard title="FAQ 정보">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">분류</label>
              <select v-model="form.category" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">순서</label>
              <input v-model.number="form.order" type="number" min="1" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">질문 <span class="text-error-500">*</span></label>
            <input v-model="form.question" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="자주 묻는 질문">
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">답변</label>
            <textarea v-model="form.answer" rows="8" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="답변을 입력하세요" />
          </div>
        </div>
      </UiCard>
    </div>
  </LayoutFormPage>
</template>
