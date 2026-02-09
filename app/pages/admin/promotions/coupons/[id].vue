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
} = useCoupon()

// 더미 데이터
const mockCoupons = [
  {
    id: 1,
    name: '신규 회원 10% 할인',
    description: '가입 후 7일 이내 사용 가능',
    couponType: 'PRODUCT',
    status: 'ISSUING',
    totalLimit: 1000,
    discountMethod: 'RATE',
    discountValue: 10,
    allowOverlap: true,
    minOrderAmount: 30000,
    maxDiscountAmount: 5000,
    validityType: 'DAYS',
    validDays: 7,
    notes: '본 쿠폰은 일부 상품에 적용되지 않을 수 있습니다.\n다른 쿠폰과 중복 사용이 불가할 수 있습니다.\n유효기간 내 미사용 시 자동 소멸됩니다.',
  },
  {
    id: 2,
    name: '첫 구매 5,000원 할인',
    description: '첫 구매 고객 전용 쿠폰',
    couponType: 'PRODUCT',
    status: 'ISSUING',
    totalLimit: 500,
    discountMethod: 'AMOUNT',
    discountValue: 5000,
    allowOverlap: false,
    minOrderAmount: 20000,
    maxDiscountAmount: 0,
    validityType: 'DAYS',
    validDays: 30,
  },
  {
    id: 3,
    name: '무료 배송 쿠폰',
    description: '5만원 이상 구매 시 무료 배송',
    couponType: 'SHIPPING',
    status: 'ISSUING',
    totalLimit: 0,
    discountMethod: 'AMOUNT',
    discountValue: 3000,
    allowOverlap: true,
    minOrderAmount: 50000,
    maxDiscountAmount: 0,
    validityType: 'DAYS',
    validDays: 30,
  },
  {
    id: 4,
    name: '여름 특별 20% 할인',
    description: '여름 시즌 한정 특별 할인',
    couponType: 'PRODUCT',
    status: 'ENDED',
    totalLimit: 2000,
    discountMethod: 'RATE',
    discountValue: 20,
    allowOverlap: false,
    minOrderAmount: 50000,
    maxDiscountAmount: 10000,
    validityType: 'PERIOD',
    validStartAt: '2025-06-01T00:00',
    validEndAt: '2025-08-31T23:59',
  },
  {
    id: 5,
    name: '교환 무료 쿠폰',
    description: '교환 배송비 무료',
    couponType: 'PRODUCT',
    status: 'REGISTERED',
    totalLimit: 100,
    discountMethod: 'AMOUNT',
    discountValue: 6000,
    allowOverlap: true,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validityType: 'DAYS',
    validDays: 90,
  },
]

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')
const couponId = computed(() => route.params.id)

// 폼 데이터
const form = ref({
  name: '',
  description: '',
  couponType: 'PRODUCT',
  status: 'REGISTERED',
  totalLimit: 0,
  discountMethod: 'AMOUNT',
  discountValue: 0,
  allowOverlap: true,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  validityType: 'DAYS',
  validDays: 30,
  validStartAt: '',
  validEndAt: '',
  notes: '',
})

// 쿠폰 타입 변경 시 기본 유의사항으로 초기화
watch(() => form.value.couponType, (newType) => {
  const defaultNotes = getDefaultNotes(newType)
  form.value.notes = defaultNotes.join('\n')
})

const isLoading = ref(false)
const isSaving = ref(false)

// 데이터 로드 (목데이터)
const fetchCoupon = async () => {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 300))

  const data = mockCoupons.find(c => c.id === Number(couponId.value))

  if (data) {
    form.value = {
      name: data.name || '',
      description: data.description || '',
      couponType: data.couponType || 'PRODUCT',
      status: data.status || 'REGISTERED',
      totalLimit: data.totalLimit || 0,
      discountMethod: data.discountMethod || 'AMOUNT',
      discountValue: data.discountValue || 0,
      allowOverlap: data.allowOverlap ?? true,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscountAmount: data.maxDiscountAmount || 0,
      validityType: data.validityType || 'DAYS',
      validDays: data.validDays || 30,
      validStartAt: data.validStartAt || '',
      validEndAt: data.validEndAt || '',
      notes: data.notes || getDefaultNotes(data.couponType || 'PRODUCT').join('\n'),
    }
  } else {
    uiStore.showToast({ type: 'error', message: '쿠폰을 찾을 수 없습니다.' })
    router.push('/admin/promotions/coupons')
  }

  isLoading.value = false
}

// 할인값 실시간 제한
const handleDiscountValueInput = () => {
  form.value.discountValue = clampDiscountValue(form.value.discountMethod, form.value.discountValue)
}

// 금액 입력 실시간 제한 (20자리)
const handleAmountInput = (field) => {
  form.value[field] = clampAmountValue(form.value[field])
}

// 저장
const handleSave = async () => {
  if (!form.value.name) {
    uiStore.showToast({ type: 'error', message: '쿠폰명을 입력해주세요.' })
    return
  }

  const discountValidation = validateDiscountValue(form.value.discountMethod, form.value.discountValue)
  if (!discountValidation.valid) {
    uiStore.showToast({ type: 'error', message: discountValidation.message })
    return
  }

  isSaving.value = true
  await new Promise(resolve => setTimeout(resolve, 300))

  if (isEditMode.value) {
    uiStore.showToast({ type: 'success', message: '쿠폰이 수정되었습니다.' })
  } else {
    uiStore.showToast({ type: 'success', message: '쿠폰이 등록되었습니다.' })
  }

  isSaving.value = false
  router.push('/admin/promotions/coupons')
}

// 삭제
const handleDelete = async () => {
  if (!confirm('이 쿠폰을 삭제하시겠습니까?')) return
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
  router.push('/admin/promotions/coupons')
}

const handleCancel = () => router.back()

onMounted(async () => {
  if (isEditMode.value) {
    await fetchCoupon()
  } else {
    form.value.notes = getDefaultNotes(form.value.couponType).join('\n')
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? '쿠폰 수정' : '쿠폰 등록'"
    :description="isEditMode ? '쿠폰 정보를 수정합니다.' : '새 쿠폰을 등록합니다.'"
    :is-saving="isSaving"
    show-cancel
    :show-delete="isEditMode"
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
            <p class="text-xs text-neutral-500 mt-0.5">쿠폰 발급 상태는 목록에서 변경할 수 있습니다.</p>
          </div>
          <span
            :class="[
              'text-sm font-bold',
              form.status === 'REGISTERED' ? 'text-neutral-600' : '',
              form.status === 'ISSUING' ? 'text-success-600' : '',
              form.status === 'STOPPED' ? 'text-warning-600' : '',
              form.status === 'ENDED' ? 'text-error-600' : '',
            ]"
          >
            {{ issuanceStatusOptions.find(s => s.value === form.status)?.label || form.status }}
          </span>
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
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="예: 신규 회원 10% 할인 쿠폰"
            >
          </div>

          <!-- 쿠폰 설명 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">쿠폰 설명</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
                  'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
                  form.couponType === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.couponType" type="radio" :value="opt.value" class="sr-only">
                {{ opt.label }}
              </label>
            </div>
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
                    'flex-1 px-4 py-2 border rounded-lg cursor-pointer transition-colors text-center text-sm',
                    form.discountMethod === opt.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                  ]"
                >
                  <input v-model="form.discountMethod" type="radio" :value="opt.value" class="sr-only">
                  {{ opt.label }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                할인 {{ form.discountMethod === 'RATE' ? '비율' : '금액' }} <span class="text-error-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model.number="form.discountValue"
                  type="number"
                  min="0"
                  :max="form.discountMethod === 'RATE' ? 99 : 999999"
                  class="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                  @input="handleDiscountValueInput"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  {{ form.discountMethod === 'RATE' ? '%' : '원' }}
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">
                {{ form.discountMethod === 'RATE' ? '최대 99%' : '최대 999,999원' }}
              </p>
            </div>
          </div>

          <!-- 정률 할인 시 최대 할인 금액 -->
          <div v-if="form.discountMethod === 'RATE'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">최대 할인 금액</label>
              <div class="relative">
                <input
                  v-model.number="form.maxDiscountAmount"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  class="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                  @input="handleAmountInput('minOrderAmount')"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">원</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">이상 주문 시 사용 가능</p>
            </div>
          </div>

          <!-- 중복 할인 여부 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">프로모션 할인과 중복 적용</label>
            <div class="flex gap-3">
              <label
                :class="[
                  'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
                  form.allowOverlap
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.allowOverlap" type="radio" :value="true" class="sr-only">
                가능
              </label>
              <label
                :class="[
                  'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
                  !form.allowOverlap
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.allowOverlap" type="radio" :value="false" class="sr-only">
                불가
              </label>
            </div>
            <p class="text-xs text-neutral-400 mt-1">불가 선택 시, 프로모션 할인 상품에서는 해당 쿠폰이 비활성화됩니다.</p>
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
                  v-model.number="form.totalLimit"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 pr-8 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
                  form.validityType === 'DAYS'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.validityType" type="radio" value="DAYS" class="sr-only">
                발급일로부터
              </label>
              <label
                :class="[
                  'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
                  form.validityType === 'PERIOD'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.validityType" type="radio" value="PERIOD" class="sr-only">
                기간 설정
              </label>
            </div>

            <!-- 발급일로부터 N일 -->
            <div v-if="form.validityType === 'DAYS'" class="flex items-center gap-3">
              <span class="text-sm text-neutral-600">다운로드 후</span>
              <input
                v-model.number="form.validDays"
                type="number"
                min="1"
                class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-center"
                placeholder="30"
              >
              <span class="text-sm text-neutral-600">일간 사용 가능</span>
            </div>

            <!-- 기간 설정 -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">시작일시</label>
                <input
                  v-model="form.validStartAt"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">종료일시</label>
                <input
                  v-model="form.validEndAt"
                  type="datetime-local"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- 유의사항 -->
      <UiCard title="유의사항">
        <textarea
          v-model="form.notes"
          rows="5"
          class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="쿠폰 유의사항을 입력하세요."
        />
        <p class="text-xs text-neutral-400 mt-1">쿠폰 타입 변경 시 기본 유의사항으로 초기화됩니다.</p>
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
</template>
