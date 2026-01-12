<script setup>
/**
 * Q&A 상세/답변 페이지
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const categoryOptions = [
  { value: 'product', label: '상품문의' },
  { value: 'delivery', label: '배송문의' },
  { value: 'exchange', label: '교환/반품' },
  { value: 'payment', label: '결제문의' },
  { value: 'etc', label: '기타' },
]

const statusOptions = [
  { value: 'pending', label: '답변대기', color: 'warning' },
  { value: 'answered', label: '답변완료', color: 'success' },
]

const qna = ref({
  id: null,
  category: '',
  title: '',
  content: '',
  author: '',
  authorId: '',
  status: 'pending',
  isSecret: false,
  createdAt: '',
  answer: '',
  answeredAt: null,
})

const isLoading = ref(true)
const isSaving = ref(false)

const fetchQna = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))
  qna.value = {
    id: route.params.id,
    category: 'product',
    title: '상품 사이즈 문의드립니다',
    content: '안녕하세요. 키 175cm 몸무게 70kg인데 M사이즈 괜찮을까요?\n\n평소에 M사이즈 입는데 조금 여유있게 입고 싶어서요.',
    author: '김철수',
    authorId: 'user001',
    status: 'pending',
    isSecret: false,
    createdAt: '2025-01-06 14:30',
    answer: '',
    answeredAt: null,
  }
  isLoading.value = false
}

const getCategoryLabel = (category) => categoryOptions.find((c) => c.value === category)?.label || category
const getStatusBadge = (status) => statusOptions.find((s) => s.value === status) || statusOptions[0]

const handleSave = async () => {
  if (!qna.value.answer.trim()) {
    uiStore.showToast({ type: 'error', message: '답변을 입력해주세요.' })
    return
  }
  isSaving.value = true
  await new Promise((resolve) => setTimeout(resolve, 500))
  qna.value.status = 'answered'
  qna.value.answeredAt = new Date().toLocaleString('ko-KR')
  uiStore.showToast({ type: 'success', message: '답변이 등록되었습니다.' })
  router.push('/admin/contents/qna')
}

const handleDelete = async () => {
  if (!confirm('이 문의를 삭제하시겠습니까?')) return
  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
  router.push('/admin/contents/qna')
}

const handleCancel = () => router.back()

onMounted(() => fetchQna())
</script>

<template>
  <LayoutFormPage title="문의 상세" description="고객 문의에 답변합니다." save-text="답변 저장" :is-saving="isSaving" show-cancel @save="handleSave" @cancel="handleCancel">
    <template #footer-left>
      <UiButton variant="danger" :disabled="isSaving" @click="handleDelete">삭제</UiButton>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center py-20"><UiSpinner size="lg" /></div>

    <template v-else>
      <!-- 문의 정보 -->
      <UiCard title="문의 정보">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <UiBadge :variant="getStatusBadge(qna.status).color" size="sm">{{ getStatusBadge(qna.status).label }}</UiBadge>
            <span class="text-sm text-neutral-500">{{ getCategoryLabel(qna.category) }}</span>
            <span v-if="qna.isSecret" class="flex items-center gap-1 text-sm text-neutral-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              비밀글
            </span>
          </div>

          <div>
            <h3 class="text-lg font-medium text-neutral-900">{{ qna.title }}</h3>
            <div class="flex items-center gap-3 mt-1 text-sm text-neutral-500">
              <span>{{ qna.author }}</span>
              <span>{{ qna.createdAt }}</span>
            </div>
          </div>

          <div class="p-4 bg-neutral-50 rounded-lg">
            <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ qna.content }}</p>
          </div>
        </div>
      </UiCard>

      <!-- 답변 -->
      <UiCard title="답변">
        <div class="space-y-2">
          <div v-if="qna.answeredAt" class="text-sm text-neutral-500">
            답변일: {{ qna.answeredAt }}
          </div>
          <textarea
            v-model="qna.answer"
            rows="8"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="답변을 입력하세요"
          />
        </div>
    </UiCard>
    </template>
  </LayoutFormPage>
</template>
