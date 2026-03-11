<script setup>
/**
 * Q&A 상세/답변 페이지 (상품 Q&A)
 *
 * API:
 * - GET /admin/qnas/{id} (상세)
 * - PATCH /admin/qnas/{id}/answer (답변 등록)
 * - DELETE /admin/qnas/{id} (삭제)
 *
 * 응답 데이터:
 * {
 *   id, userId, productId, productName, productThumbnailUrl,
 *   orderId, category, title, question,
 *   isSecret, isAnswered, answer, answeredBy, answeredAt, status, isVisible,
 *   createdAt, updatedAt
 * }
 */

import { useUiStore } from '~/stores/ui'
import { useApi } from '~/composables/useApi'
import { formatDate } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const { get, patch, del } = useApi()

const qnaId = computed(() => route.params.id)
const { public: { shopBaseUrl } } = useRuntimeConfig()

// 상품 페이지 URL
const productUrl = computed(() => {
  if (!shopBaseUrl || !qna.value.productId) return ''
  return `${shopBaseUrl}/products/${qna.value.productId}`
})

// 상태 옵션
const statusOptions = [
  { value: 'PENDING', label: '답변대기', color: 'warning' },
  { value: 'ANSWERED', label: '답변완료', color: 'success' },
  { value: 'CLOSED', label: '종료', color: 'neutral' },
]

// Q&A 데이터
const qna = ref({
  id: null,
  userId: null,
  productId: null,
  productName: '',
  productThumbnailUrl: '',
  orderId: null,
  category: '',
  title: '',
  question: '',
  isSecret: false,
  isAnswered: false,
  answer: '',
  answeredBy: null,
  answeredAt: null,
  status: 'PENDING',
  isVisible: true,
  createdAt: '',
  updatedAt: '',
})

const isLoading = ref(false)
const isSaving = ref(false)

// 답변 폼
const answerForm = ref('')

// Q&A 상세 조회
const fetchQna = async () => {
  isLoading.value = true

  try {
    const response = await get(`/admin/qnas/${qnaId.value}`)
    const data = response.data

    qna.value = {
      id: data.id,
      userId: data.userId,
      productId: data.productId,
      productName: data.productName || '',
      productThumbnailUrl: data.productThumbnailUrl || '',
      orderId: data.orderId,
      category: data.category || '',
      title: data.title || '',
      question: data.question || '',
      isSecret: data.isSecret ?? false,
      isAnswered: data.isAnswered ?? false,
      answer: data.answer || '',
      answeredBy: data.answeredBy,
      answeredAt: data.answeredAt,
      status: data.status || 'PENDING',
      isVisible: data.isVisible ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }

    // 기존 답변이 있으면 폼에 세팅
    answerForm.value = data.answer || ''
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: error.message || 'Q&A를 불러오는데 실패했습니다.',
    })
    router.push('/admin/contents/qna')
  } finally {
    isLoading.value = false
  }
}

// 헬퍼
const getStatusBadge = (status) => {
  return statusOptions.find((s) => s.value === status) || { label: status || '-', color: 'neutral' }
}

// 답변 저장
const handleSave = async () => {
  if (!answerForm.value.trim()) {
    uiStore.showToast({ type: 'error', message: '답변을 입력해주세요.' })
    return
  }

  isSaving.value = true

  try {
    await patch(`/admin/qnas/${qnaId.value}/answer`, {
      answer: answerForm.value,
    })

    uiStore.showToast({ type: 'success', message: '답변이 등록되었습니다.' })
    router.push('/admin/contents/qna')
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: error.message || '답변 저장에 실패했습니다.',
    })
  } finally {
    isSaving.value = false
  }
}

// 삭제
const handleDelete = async () => {
  if (!confirm('이 문의를 삭제하시겠습니까?')) return

  try {
    await del(`/admin/qnas/${qnaId.value}`)
    uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
    router.push('/admin/contents/qna')
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: error.message || '삭제에 실패했습니다.',
    })
  }
}

const handleCancel = () => router.back()

onMounted(() => {
  fetchQna()
})
</script>

<template>
  <LayoutFormPage
    title="문의 상세"
    description="고객 문의에 답변합니다."
    save-text="답변 저장"
    :is-saving="isSaving"
    show-cancel
    show-delete
    @save="handleSave"
    @cancel="handleCancel"
    @delete="handleDelete"
  >
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <template v-else>
      <!-- 문의 정보 -->
      <UiCard title="문의 정보">
        <div class="space-y-4">
          <div class="flex items-center gap-3 flex-wrap">
            <UiBadge :variant="getStatusBadge(qna.status).color" size="sm">
              {{ getStatusBadge(qna.status).label }}
            </UiBadge>
            <span v-if="qna.isSecret" class="flex items-center gap-1 text-sm text-neutral-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              비밀글
            </span>
          </div>

          <div>
            <h3 class="text-lg font-medium text-neutral-900">{{ qna.title || '-' }}</h3>
            <div class="flex items-center gap-3 mt-1 text-sm text-neutral-500">
              <span>회원 ID: {{ qna.userId || '-' }}</span>
              <span>{{ qna.createdAt ? formatDate(qna.createdAt) : '-' }}</span>
            </div>
          </div>

          <!-- 상품 정보 -->
          <component
            :is="productUrl ? 'a' : 'div'"
            v-if="qna.productId"
            :href="productUrl || undefined"
            :target="productUrl ? '_blank' : undefined"
            :rel="productUrl ? 'noopener noreferrer' : undefined"
            class="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
            :class="{ 'hover:bg-neutral-100 hover:border-neutral-300 transition-colors cursor-pointer': productUrl }"
          >
            <img
              v-if="qna.productThumbnailUrl"
              :src="qna.productThumbnailUrl"
              :alt="qna.productName"
              class="w-14 h-14 rounded-lg object-cover border border-neutral-200 flex-shrink-0"
            >
            <div v-else class="w-14 h-14 rounded-lg bg-neutral-200 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-neutral-900 truncate">{{ qna.productName || '-' }}</p>
              <p class="text-xs text-neutral-500 mt-0.5">상품 ID: {{ qna.productId }}</p>
            </div>
            <svg
              v-if="productUrl"
              class="w-4 h-4 text-neutral-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </component>

          <!-- 주문 정보 -->
          <div v-if="qna.orderId" class="text-sm text-neutral-500">
            주문 ID: <span class="text-neutral-700">{{ qna.orderId }}</span>
          </div>

          <div class="p-4 bg-neutral-50 rounded-lg">
            <p class="text-sm text-neutral-700 whitespace-pre-wrap">{{ qna.question || '-' }}</p>
          </div>
        </div>
      </UiCard>

      <!-- 답변 -->
      <UiCard title="답변">
        <div class="space-y-3">
          <div v-if="qna.answeredAt" class="flex items-center gap-4 text-sm text-neutral-500">
            <span>답변일: {{ formatDate(qna.answeredAt) }}</span>
            <span v-if="qna.answeredBy">답변자 ID: {{ qna.answeredBy }}</span>
          </div>
          <textarea
            v-model="answerForm"
            rows="8"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="답변을 입력하세요"
          />
        </div>
      </UiCard>
    </template>
  </LayoutFormPage>
</template>
