<script setup>
/**
 * 정책 설정 페이지
 * - 주문 정책
 * - 배송 정책
 * - 상품 정책
 * - 반품 정책
 */

import { useUiStore } from '~/stores/ui'
import { formatCurrency } from '~/utils/formatters'

const uiStore = useUiStore()

// 로딩/저장 상태
const isLoading = ref(true)
const isSaving = ref(false)

// 활성 탭
const activeTab = ref('order')
const tabs = [
  { id: 'order', label: '주문 정책' },
  { id: 'shipping', label: '배송 정책' },
  { id: 'product', label: '상품 정책' },
  { id: 'return', label: '반품 정책' },
]

// 정책 데이터
const policies = ref({
  // 주문 정책
  order: {
    minOrderAmount: 0,
    maxOrderAmount: 10000000,
    maxOrderQuantity: 100,
    orderCancelTime: 24,
    autoConfirmDays: 7,
    pointEarnRate: 1,
    pointUseMinOrder: 10000,
    pointUseMinAmount: 1000,
  },
  // 배송 정책
  shipping: {
    freeShippingAmount: 50000,
    defaultShippingFee: 3000,
    additionalAreaFee: 3000,
    additionalAreas: '제주, 도서산간',
    estimatedDays: '2-3',
    shippingNotice: '',
  },
  // 상품 정책
  product: {
    defaultTaxRate: 10,
    displaySoldout: true,
    displayStock: false,
    lowStockThreshold: 10,
    maxOptionCount: 3,
    maxImageCount: 10,
    productNotice: '',
  },
  // 반품 정책
  return: {
    returnPeriod: 7,
    exchangePeriod: 7,
    returnShippingFee: 3000,
    exchangeShippingFee: 6000,
    returnAddress: '',
    returnNotice: '',
    nonReturnableItems: '',
  },
})

// Mock 데이터 로드
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  policies.value = {
    order: {
      minOrderAmount: 10000,
      maxOrderAmount: 10000000,
      maxOrderQuantity: 99,
      orderCancelTime: 24,
      autoConfirmDays: 7,
      pointEarnRate: 1,
      pointUseMinOrder: 10000,
      pointUseMinAmount: 1000,
    },
    shipping: {
      freeShippingAmount: 50000,
      defaultShippingFee: 3000,
      additionalAreaFee: 3000,
      additionalAreas: '제주도, 울릉도, 도서산간 지역',
      estimatedDays: '2~3',
      shippingNotice: '평일 오후 2시 이전 주문 시 당일 출고됩니다.\n주말 및 공휴일은 배송이 불가합니다.',
    },
    product: {
      defaultTaxRate: 10,
      displaySoldout: true,
      displayStock: false,
      lowStockThreshold: 10,
      maxOptionCount: 3,
      maxImageCount: 10,
      productNotice: '상품 이미지는 실제 상품과 다소 차이가 있을 수 있습니다.',
    },
    return: {
      returnPeriod: 7,
      exchangePeriod: 7,
      returnShippingFee: 3000,
      exchangeShippingFee: 6000,
      returnAddress: '서울시 강남구 테헤란로 123 반품센터',
      returnNotice: '상품 수령 후 7일 이내 반품 신청이 가능합니다.\n단순 변심에 의한 반품 시 왕복 배송비가 부과됩니다.',
      nonReturnableItems: '개봉한 상품, 착용 흔적이 있는 의류, 세탁한 상품, 향수/화장품 등',
    },
  }

  isLoading.value = false
})

// 저장
const handleSave = async () => {
  isSaving.value = true

  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 1000))

  isSaving.value = false

  uiStore.showToast({
    type: 'success',
    message: '정책 설정이 저장되었습니다.',
  })
}
</script>

<template>
  <LayoutFormPage
    title="정책 설정"
    description="쇼핑몰 운영에 필요한 각종 정책을 설정합니다."
    :is-saving="isSaving"
    @save="handleSave"
  >
    <template #header>
      <!-- Tabs -->
      <div class="border-b border-neutral-200 mt-4 -mx-6 px-6">
        <nav class="flex gap-4 -mb-px overflow-x-auto scrollbar-hidden">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="[
              'py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </template>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Content -->
    <template v-else>

      <!-- Tab Content: 주문 정책 -->
      <div v-if="activeTab === 'order'" class="space-y-6">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">주문 제한</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                최소 주문금액
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.minOrderAmount"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">0으로 설정 시 제한 없음</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                최대 주문금액
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.maxOrderAmount"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                최대 주문수량 (1회)
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.maxOrderQuantity"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">개</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                주문 취소 가능 시간
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.orderCancelTime"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">시간 이내</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">결제 완료 후 취소 가능한 시간</p>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">자동 구매확정</h3>
          </template>
          <div class="max-w-md">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              배송완료 후 자동 구매확정
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="policies.order.autoConfirmDays"
                type="number"
                class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
              <span class="text-sm text-neutral-500">일 후</span>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">적립금 정책</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                기본 적립율
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.pointEarnRate"
                  type="number"
                  step="0.1"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">%</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                적립금 사용 최소 주문금액
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.pointUseMinOrder"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원 이상</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                최소 사용 적립금
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.order.pointUseMinAmount"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원 이상</span>
              </div>
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Tab Content: 배송 정책 -->
      <div v-if="activeTab === 'shipping'" class="space-y-6">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">배송비 설정</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                무료배송 기준금액
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.shipping.freeShippingAmount"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원 이상</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                기본 배송비
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.shipping.defaultShippingFee"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                도서산간 추가 배송비
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.shipping.additionalAreaFee"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                추가 배송비 지역
              </label>
              <input
                v-model="policies.shipping.additionalAreas"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="제주도, 도서산간"
              >
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">배송 안내</h3>
          </template>
          <div class="space-y-4">
            <div class="max-w-md">
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                예상 배송기간
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="policies.shipping.estimatedDays"
                  type="text"
                  class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="2~3"
                >
                <span class="text-sm text-neutral-500">영업일</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                배송 안내문
              </label>
              <textarea
                v-model="policies.shipping.shippingNotice"
                rows="4"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="배송 관련 안내 사항을 입력하세요"
              />
            </div>
          </div>
        </UiCard>
      </div>

      <!-- Tab Content: 상품 정책 -->
      <div v-if="activeTab === 'product'" class="space-y-6">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">상품 설정</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                기본 세율
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.product.defaultTaxRate"
                  type="number"
                  class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">%</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                재고 부족 알림 기준
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.product.lowStockThreshold"
                  type="number"
                  class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">개 이하</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                최대 옵션 수
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.product.maxOptionCount"
                  type="number"
                  class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">개</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                최대 이미지 수
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.product.maxImageCount"
                  type="number"
                  class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">개</span>
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">상품 표시 설정</h3>
          </template>
          <div class="space-y-4">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="policies.product.displaySoldout"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              >
              <span class="text-sm text-neutral-700">품절 상품 표시</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="policies.product.displayStock"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              >
              <span class="text-sm text-neutral-700">재고 수량 표시</span>
            </label>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">상품 안내문</h3>
          </template>
          <textarea
            v-model="policies.product.productNotice"
            rows="4"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="상품 공통 안내 사항을 입력하세요"
          />
        </UiCard>
      </div>

      <!-- Tab Content: 반품 정책 -->
      <div v-if="activeTab === 'return'" class="space-y-6">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">반품/교환 기간</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                반품 가능 기간
              </label>
              <div class="flex items-center gap-2">
                <span class="text-sm text-neutral-500">수령 후</span>
                <input
                  v-model.number="policies.return.returnPeriod"
                  type="number"
                  class="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">일 이내</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                교환 가능 기간
              </label>
              <div class="flex items-center gap-2">
                <span class="text-sm text-neutral-500">수령 후</span>
                <input
                  v-model.number="policies.return.exchangePeriod"
                  type="number"
                  class="w-20 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">일 이내</span>
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">반품/교환 배송비</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                반품 배송비 (편도)
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.return.returnShippingFee"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">단순 변심 시 고객 부담</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                교환 배송비 (왕복)
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="policies.return.exchangeShippingFee"
                  type="number"
                  class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                <span class="text-sm text-neutral-500">원</span>
              </div>
              <p class="text-xs text-neutral-400 mt-1">단순 변심 시 고객 부담</p>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">반품 주소</h3>
          </template>
          <input
            v-model="policies.return.returnAddress"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="반품 수거지 주소를 입력하세요"
          >
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">반품 불가 품목</h3>
          </template>
          <textarea
            v-model="policies.return.nonReturnableItems"
            rows="3"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="반품이 불가능한 상품 유형을 입력하세요"
          />
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">반품/교환 안내문</h3>
          </template>
          <textarea
            v-model="policies.return.returnNotice"
            rows="4"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="반품/교환 관련 안내 사항을 입력하세요"
          />
        </UiCard>
      </div>

    </template>
  </LayoutFormPage>
</template>
