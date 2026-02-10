<script setup>
/**
 * 쿠폰 등록/수정 페이지
 * - /admin/promotions/coupons/new → 등록 모드
 * - /admin/promotions/coupons/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'
import { useCoupon } from '~/composables/useCoupon'
import { validateDiscountValue, clampDiscountValue, clampAmountValue } from '~/utils/discountValidation'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const {
  couponTypeOptions,
  issuanceStatusOptions,
  discountMethodOptions,
  getDefaultNotes,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
} = useCoupon()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')
const couponId = computed(() => route.params.id)

// 발급중 상태면 수정 불가
const isDisabled = computed(() => isEditMode.value && form.value.status === 'ACTIVE')

// 폼 데이터
const form = ref({
  name: '',
  description: '',
  couponType: 'PRODUCT_DISCOUNT',
  status: 'REGISTERED',
  totalQuantity: 0,
  discountType: 'AMOUNT',
  discountValue: 0,
  allowPromotionOverlap: false,
  allowDuplicateUse: false,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  validityType: 'DAYS_FROM_DOWNLOAD',
  validityDays: 30,
  validFrom: '',
  validTo: '',
  notice: '',
})

// 쿠폰 타입 변경 시 기본 유의사항으로 초기화
watch(() => form.value.couponType, (newType) => {
  const defaultNotes = getDefaultNotes(newType)
  form.value.notice = defaultNotes.join('\n')
})

const isLoading = ref(false)
const isSaving = ref(false)

// 데이터 로드
const fetchCoupon = async () => {
  isLoading.value = true

  try {
    const data = await getCoupon(couponId.value)

    form.value = {
      name: data.name || '',
      description: data.description || '',
      couponType: data.couponType || 'PRODUCT_DISCOUNT',
      status: data.status || 'REGISTERED',
      totalQuantity: data.totalQuantity || 0,
      discountType: data.discountType || 'AMOUNT',
      discountValue: data.discountValue || 0,
      allowPromotionOverlap: data.allowPromotionOverlap ?? false,
      allowDuplicateUse: data.allowDuplicateUse ?? false,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscountAmount: data.maxDiscountAmount || 0,
      validityType: data.validityType || 'DAYS_FROM_DOWNLOAD',
      validityDays: data.validityDays || 30,
      validFrom: data.validFrom ? data.validFrom.slice(0, 16) : '',
      validTo: data.validTo ? data.validTo.slice(0, 16) : '',
      notice: data.notice || getDefaultNotes(data.couponType || 'PRODUCT_DISCOUNT').join('\n'),
    }
  } catch (error) {
    uiStore.showToast({ type: 'error', message: error.message || '쿠폰을 찾을 수 없습니다.' })
    router.push('/admin/promotions/coupons')
  } finally {
    isLoading.value = false
  }
}

// 할인값 실시간 제한
const handleDiscountValueInput = () => {
  form.value.discountValue = clampDiscountValue(form.value.discountType, form.value.discountValue)
}

// 금액 입력 실시간 제한 (20자리)
const handleAmountInput = (field) => {
  form.value[field] = clampAmountValue(form.value[field])
}

// API 요청 페이로드 생성
const buildPayload = () => {
  const payload = {
    name: form.value.name,
    description: form.value.description,
    couponType: form.value.couponType,
    notice: form.value.notice,
    discountType: form.value.discountType,
    discountValue: form.value.discountValue,
    maxDiscountAmount: form.value.maxDiscountAmount,
    minOrderAmount: form.value.minOrderAmount,
    totalQuantity: form.value.totalQuantity,
    validityType: form.value.validityType,
    allowPromotionOverlap: form.value.allowPromotionOverlap,
    allowDuplicateUse: form.value.allowDuplicateUse,
  }

  if (form.value.validityType === 'DAYS_FROM_DOWNLOAD') {
    payload.validityDays = form.value.validityDays
  } else {
    payload.validFrom = form.value.validFrom ? new Date(form.value.validFrom).toISOString() : null
    payload.validTo = form.value.validTo ? new Date(form.value.validTo).toISOString() : null
  }

  return payload
}

// 저장
const handleSave = async () => {
  if (!form.value.name) {
    uiStore.showToast({ type: 'error', message: '쿠폰명을 입력해주세요.' })
    return
  }

  const discountValidation = validateDiscountValue(form.value.discountType, form.value.discountValue)
  if (!discountValidation.valid) {
    uiStore.showToast({ type: 'error', message: discountValidation.message })
    return
  }

  isSaving.value = true

  try {
    const payload = buildPayload()

    if (isEditMode.value) {
      await updateCoupon(couponId.value, payload)
      uiStore.showToast({ type: 'success', message: '쿠폰이 수정되었습니다.' })
    } else {
      await createCoupon(payload)
      uiStore.showToast({ type: 'success', message: '쿠폰이 등록되었습니다.' })
    }

    router.push('/admin/promotions/coupons')
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: error.message || '저장에 실패했습니다.',
    })
  } finally {
    isSaving.value = false
  }
}

// 삭제
const handleDelete = async () => {
  if (!confirm('이 쿠폰을 삭제하시겠습니까?')) return

  try {
    await deleteCoupon(couponId.value)
    uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
    router.push('/admin/promotions/coupons')
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: error.message || '삭제에 실패했습니다.',
    })
  }
}

const handleCancel = () => router.back()

// 상태 변경 모달
const showStatusModal = ref(false)
const targetStatus = ref('')

const openStatusModal = (status) => {
  targetStatus.value = status
  showStatusModal.value = true
}

const handleStatusChange = async () => {
  try {
    await updateCouponStatus(couponId.value, targetStatus.value)

    const statusLabel = issuanceStatusOptions.find(s => s.value === targetStatus.value)?.label || targetStatus.value
    uiStore.showToast({
      type: 'success',
      message: `쿠폰이 ${statusLabel} 처리되었습니다.`,
    })

    form.value.status = targetStatus.value
    showStatusModal.value = false
  } catch (error) {
    uiStore.showToast({
      type: 'error',
      message: error.message || '상태 변경에 실패했습니다.',
    })
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    await fetchCoupon()
  } else {
    form.value.notice = getDefaultNotes(form.value.couponType).join('\n')
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? '쿠폰 수정' : '쿠폰 등록'"
    :description="isEditMode ? '쿠폰 정보를 수정합니다.' : '새 쿠폰을 등록합니다.'"
    :is-saving="isSaving"
    :save-disabled="isDisabled"
    :show-save="!isDisabled"
    show-cancel
    :show-delete="isEditMode && !isDisabled"
    @save="handleSave"
    @cancel="handleCancel"
    @delete="handleDelete"
  >
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- 발급 상태 (수정 모드에서만) -->
      <UiCard v-if="isEditMode" title="발급 상태">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-neutral-900">현재 상태</p>
            <p class="text-xs text-neutral-500 mt-0.5">상태를 변경하려면 우측 버튼을 클릭하세요.</p>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="[
                'text-sm font-bold',
                form.status === 'REGISTERED' ? 'text-neutral-600' : '',
                form.status === 'ACTIVE' ? 'text-success-600' : '',
                form.status === 'STOPPED' ? 'text-warning-600' : '',
                form.status === 'ENDED' ? 'text-error-600' : '',
              ]"
            >
              {{ issuanceStatusOptions.find(s => s.value === form.status)?.label || form.status }}
            </span>

            <!-- 상태 변경 버튼 -->
            <!-- 등록 → 발급 시작 -->
            <button
              v-if="form.status === 'REGISTERED'"
              class="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              @click="openStatusModal('ACTIVE')"
            >
              발급 시작
            </button>

            <!-- 발급중 → 발급 중지 -->
            <button
              v-else-if="form.status === 'ACTIVE'"
              class="px-3 py-1.5 text-xs font-medium text-white bg-warning-600 hover:bg-warning-700 rounded-lg transition-colors"
              @click="openStatusModal('STOPPED')"
            >
              발급 중지
            </button>

            <!-- 발급중지 → 발급 재개 또는 종료 -->
            <template v-else-if="form.status === 'STOPPED'">
              <button
                class="px-3 py-1.5 text-xs font-medium text-white bg-success-600 hover:bg-success-700 rounded-lg transition-colors"
                @click="openStatusModal('ACTIVE')"
              >
                발급 재개
              </button>
              <button
                class="px-3 py-1.5 text-xs font-medium text-white bg-error-600 hover:bg-error-700 rounded-lg transition-colors"
                @click="openStatusModal('ENDED')"
              >
                종료
              </button>
            </template>
          </div>
        </div>

        <!-- 발급중일 때 수정 불가 안내 -->
        <div v-if="isDisabled" class="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div class="flex gap-2">
            <svg class="w-5 h-5 text-warning-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-sm text-warning-700">
              발급중인 쿠폰은 수정할 수 없습니다. 수정이 필요한 경우 발급을 중지한 후 수정해주세요.
            </p>
          </div>
        </div>
      </UiCard>

      <!-- 기본 정보 -->
      <UiCard title="기본 정보">
        <div class="space-y-4">
          <!-- 쿠폰명 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              쿠폰명 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              :disabled="isDisabled"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
              placeholder="예: 신규 회원 10% 할인 쿠폰"
            >
          </div>

          <!-- 쿠폰 설명 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">쿠폰 설명</label>
            <textarea
              v-model="form.description"
              rows="2"
              :disabled="isDisabled"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
              placeholder="쿠폰 사용 안내 문구를 입력하세요."
            />
          </div>

          <!-- 쿠폰 타입 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">
              쿠폰 타입 <span class="text-error-500">*</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="opt in couponTypeOptions"
                :key="opt.value"
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  form.couponType === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.couponType" type="radio" :value="opt.value" :disabled="isDisabled" class="sr-only">
                {{ opt.label }}
              </label>
            </div>
          </div>

          <!-- 유의사항 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">유의사항</label>
            <textarea
              v-model="form.notice"
              rows="4"
              :disabled="isDisabled"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
              placeholder="쿠폰 유의사항을 입력하세요."
            />
            <p class="text-xs text-neutral-400 mt-1">쿠폰 타입 변경 시 기본 유의사항으로 초기화됩니다.</p>
          </div>
        </div>
      </UiCard>

      <!-- 할인 정책 -->
      <UiCard title="할인 정책">
        <div class="space-y-4">
          <!-- 할인 방식 & 금액 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                할인 방식 <span class="text-error-500">*</span>
              </label>
              <div class="flex gap-2">
                <label
                  v-for="opt in discountMethodOptions"
                  :key="opt.value"
                  :class="[
                    'flex-1 px-4 py-2 border rounded-lg transition-colors text-center text-sm',
                    isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    form.discountType === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                  ]"
                >
                  <input v-model="form.discountType" type="radio" :value="opt.value" :disabled="isDisabled" class="sr-only">
                  {{ opt.label }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                할인 {{ form.discountType === 'RATE' ? '비율' : '금액' }} <span class="text-error-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.discountValue"
                  type="number"
                  min="0"
                  :max="form.discountType === 'RATE' ? 99 : 999999"
                  :disabled="isDisabled"
                  class="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                  placeholder="0"
                  @input="handleDiscountValueInput"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  {{ form.discountType === 'RATE' ? '%' : '원' }}
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">
                {{ form.discountType === 'RATE' ? '최대 99%' : '최대 999,999원' }}
              </p>
            </div>
          </div>

          <!-- 정률 할인 시 최대 할인 금액 -->
          <div v-if="form.discountType === 'RATE'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">최대 할인 금액</label>
              <div class="relative">
                <input
                  v-model.number="form.maxDiscountAmount"
                  type="number"
                  min="0"
                  :disabled="isDisabled"
                  class="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                  placeholder="0"
                  @input="handleAmountInput('maxDiscountAmount')"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">원</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">0 입력 시 제한 없음</p>
            </div>
          </div>

          <!-- 최소 주문 금액 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">최소 주문 금액</label>
              <div class="relative">
                <input
                  v-model.number="form.minOrderAmount"
                  type="number"
                  min="0"
                  :disabled="isDisabled"
                  class="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                  placeholder="0"
                  @input="handleAmountInput('minOrderAmount')"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">원</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">이상 주문 시 사용 가능</p>
            </div>
          </div>

          <!-- 프로모션 할인과 중복 적용 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">프로모션 할인과 중복 적용</label>
            <div class="flex gap-3">
              <label
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  form.allowPromotionOverlap
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.allowPromotionOverlap" type="radio" :value="true" :disabled="isDisabled" class="sr-only">
                가능
              </label>
              <label
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  !form.allowPromotionOverlap
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.allowPromotionOverlap" type="radio" :value="false" :disabled="isDisabled" class="sr-only">
                불가
              </label>
            </div>
            <p class="text-xs text-neutral-400 mt-1">불가 선택 시, 프로모션 할인 상품에서는 해당 쿠폰이 비활성화됩니다.</p>
          </div>

          <!-- 중복 사용 여부 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">동일 쿠폰 중복 사용</label>
            <div class="flex gap-3">
              <label
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  form.allowDuplicateUse
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.allowDuplicateUse" type="radio" :value="true" :disabled="isDisabled" class="sr-only">
                가능
              </label>
              <label
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  !form.allowDuplicateUse
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.allowDuplicateUse" type="radio" :value="false" :disabled="isDisabled" class="sr-only">
                불가
              </label>
            </div>
            <p class="text-xs text-neutral-400 mt-1">가능 선택 시, 한 회원이 동일 쿠폰을 여러 번 다운로드하여 사용할 수 있습니다.</p>
          </div>
        </div>
      </UiCard>

      <!-- 발급 설정 -->
      <UiCard title="발급 설정">
        <div class="space-y-4">
          <!-- 총 발급 수량 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">총 발급 수량</label>
              <div class="relative">
                <input
                  v-model.number="form.totalQuantity"
                  type="number"
                  min="0"
                  :disabled="isDisabled"
                  class="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                  placeholder="0"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">매</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">0 입력 시 무제한</p>
            </div>
          </div>

          <!-- 유효기간 설정 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">유효기간 설정</label>
            <div class="flex gap-3 mb-4">
              <label
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  form.validityType === 'DAYS_FROM_DOWNLOAD'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.validityType" type="radio" value="DAYS_FROM_DOWNLOAD" :disabled="isDisabled" class="sr-only">
                발급일로부터
              </label>
              <label
                :class="[
                  'px-4 py-2 border rounded-lg transition-colors text-sm',
                  isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  form.validityType === 'PERIOD'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.validityType" type="radio" value="PERIOD" :disabled="isDisabled" class="sr-only">
                기간 설정
              </label>
            </div>

            <!-- 발급일로부터 N일 -->
            <div v-if="form.validityType === 'DAYS_FROM_DOWNLOAD'" class="flex items-center gap-3">
              <span class="text-sm text-neutral-600">다운로드 후</span>
              <input
                v-model.number="form.validityDays"
                type="number"
                min="1"
                :disabled="isDisabled"
                class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-center disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                placeholder="30"
              >
              <span class="text-sm text-neutral-600">일간 사용 가능</span>
            </div>

            <!-- 기간 설정 -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">시작일시</label>
                <input
                  v-model="form.validFrom"
                  type="datetime-local"
                  :disabled="isDisabled"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                >
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">종료일시</label>
                <input
                  v-model="form.validTo"
                  type="datetime-local"
                  :disabled="isDisabled"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
                >
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- 안내 -->
      <div class="p-4 bg-neutral-100 rounded-lg">
        <div class="flex gap-3">
          <svg class="w-5 h-5 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-neutral-600">
            소비자는 다운로드 페이지에서 직접 쿠폰을 다운로드하며, 결제 시 <strong>한 주문당 최대 1개</strong>의 쿠폰만 사용 가능합니다.
          </p>
        </div>
      </div>
    </div>
  </LayoutFormPage>

  <!-- 상태 변경 모달 -->
  <DomainCouponStatusModal
    v-model="showStatusModal"
    :coupon-name="form.name"
    :target-status="targetStatus"
    @confirm="handleStatusChange"
  />
</template>
