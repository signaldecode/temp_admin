<script setup>
/**
 * 주문 상세 페이지
 * - 주문 회원 정보
 * - 결제 정보
 * - 배송지 정보
 * - 주문 상품 정보
 * - 주문 이력
 */
import { useUiStore } from '~/stores/ui'
import { formatCurrency, formatDate } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const uiStore = useUiStore()

const orderId = computed(() => route.params.id)

// 로딩 상태
const isLoading = ref(true)
const error = ref(null)
const isChangingStatus = ref(false)

// 주문 정보
const order = ref(null)

// 택배사 목록
const carriers = ref([])

// 주문 상태 매핑
const statusMap = {
  PENDING: { label: '결제대기', variant: 'neutral' },
  PAID: { label: '결제완료', variant: 'primary' },
  PREPARING: { label: '상품준비중', variant: 'warning' },
  SHIPPING: { label: '배송중', variant: 'info' },
  DELIVERED: { label: '배송완료', variant: 'success' },
  CANCELLED: { label: '취소', variant: 'error' },
  REFUNDED: { label: '환불', variant: 'error' },
}

// 결제 수단 매핑
const paymentMethodMap = {
  CARD: '신용카드',
  BANK_TRANSFER: '계좌이체',
  VIRTUAL_ACCOUNT: '가상계좌',
  PHONE: '휴대폰',
  KAKAO_PAY: '카카오페이',
  NAVER_PAY: '네이버페이',
  POINT: '포인트',
}

// 결제 상태 매핑
const paymentStatusMap = {
  PENDING: { label: '결제대기', variant: 'warning' },
  PAID: { label: '결제완료', variant: 'success' },
  FAILED: { label: '결제실패', variant: 'error' },
  CANCELLED: { label: '취소', variant: 'neutral' },
  REFUNDED: { label: '환불완료', variant: 'neutral' },
  PARTIAL_REFUNDED: { label: '부분환불', variant: 'warning' },
}

// 주문 상태 옵션
const statusOptions = [
  { value: 'PENDING', label: '결제대기' },
  { value: 'PAID', label: '결제완료' },
  { value: 'PREPARING', label: '상품준비중' },
  { value: 'SHIPPING', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CANCELLED', label: '취소' },
  { value: 'REFUNDED', label: '환불' },
]

// 데이터 로드
const fetchOrder = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await $api.get(`/admin/orders/${orderId.value}`)
    order.value = response.data
  } catch (err) {
    console.error('Order fetch error:', err)
    error.value = err.data?.message || err.message || '주문 정보를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 택배사 목록 로드
const fetchCarriers = async () => {
  try {
    const response = await $api.get('/admin/delivery/carriers')
    carriers.value = response.data || []
  } catch (err) {
    console.error('Carriers fetch error:', err)
  }
}

// 주문 회원 정보 아이템
const userInfoItems = computed(() => {
  if (!order.value?.customer) return []
  const c = order.value.customer
  return [
    { key: 'userId', label: '유저ID', value: c.userId },
    { key: 'name', label: '이름', value: c.name },
    { key: 'phone', label: '연락처', value: c.phone || '-' },
    { key: 'email', label: '이메일', value: c.email || '-' },
  ]
})

// 결제 정보 아이템
const paymentInfoItems = computed(() => {
  if (!order.value?.payment) return []
  const p = order.value.payment
  const items = [
    { key: 'method', label: '결제수단', value: paymentMethodMap[p.method] || p.method },
  ]

  if (p.cardCompany) {
    items.push({ key: 'card', label: '카드정보', value: `${p.cardCompany} (${p.cardNumber || ''})` })
  }

  if (p.installment !== undefined && p.installment !== null) {
    items.push({ key: 'installment', label: '할부', value: p.installment === 0 ? '일시불' : `${p.installment}개월` })
  }

  items.push(
    { key: 'status', label: '결제상태', value: p.status },
    { key: 'paidAt', label: '결제일시', value: formatDate(p.paidAt) },
    { key: 'transactionId', label: '거래번호', value: p.transactionId || '-' }
  )

  return items
})

// 배송지 정보 아이템
const shippingInfoItems = computed(() => {
  if (!order.value?.shipping) return []
  const s = order.value.shipping
  const items = [
    { key: 'recipientName', label: '수령인', value: s.recipientName },
    { key: 'recipientPhone', label: '연락처', value: s.recipientPhone },
    { key: 'postalCode', label: '우편번호', value: s.postalCode },
    { key: 'address', label: '주소', value: s.address },
  ]

  if (s.deliveryMessage) {
    items.push({ key: 'memo', label: '배송메모', value: s.deliveryMessage })
  }

  if (s.trackingNumber) {
    items.push({ key: 'tracking', label: '운송장', value: s.trackingNumber })
  }

  return items
})

// 목록으로 돌아가기
const goBack = () => {
  router.push('/admin/orders')
}

// 회원 상세로 이동
const goToUser = (userId) => {
  router.push(`/admin/users/${userId}`)
}

// 상태 변경 모달
const showStatusModal = ref(false)
const selectedStatus = ref('')
const selectedCarrierId = ref('')
const trackingNumber = ref('')
const statusReason = ref('')

// 배송중 상태에서 송장번호 필수 여부
const isShippingSelected = computed(() => selectedStatus.value === 'SHIPPING')
const canChangeStatus = computed(() => {
  if (!selectedStatus.value || selectedStatus.value === order.value?.status) return false
  if (isShippingSelected.value && (!selectedCarrierId.value || !trackingNumber.value.trim())) return false
  return true
})

const openStatusModal = () => {
  selectedStatus.value = order.value.status
  selectedCarrierId.value = ''
  trackingNumber.value = ''
  statusReason.value = ''
  showStatusModal.value = true
}

const handleStatusChange = async () => {
  if (!canChangeStatus.value) return

  isChangingStatus.value = true

  try {
    const payload = {
      orderIds: [Number(orderId.value)],
      status: selectedStatus.value,
      reason: statusReason.value || undefined,
    }

    // 배송중 상태로 변경 시 송장 정보 추가
    if (isShippingSelected.value) {
      payload.carrierId = Number(selectedCarrierId.value)
      payload.trackingNumber = trackingNumber.value
    }

    await $api.patch('/admin/orders/statuses', payload)

    showStatusModal.value = false

    uiStore.showToast({
      type: 'success',
      message: '주문 상태가 변경되었습니다.',
    })

    // 주문 정보 새로고침
    await fetchOrder()
  } catch (err) {
    console.error('Status change error:', err)
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || err.message || '상태 변경에 실패했습니다.',
    })
  } finally {
    isChangingStatus.value = false
  }
}

// 초기 로드
onMounted(() => {
  fetchOrder()
  fetchCarriers()
})
</script>

<template>
  <LayoutDetailPage>
    <!-- Page Header -->
    <div class="mb-6">
      <button
        type="button"
        class="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
        @click="goBack"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        주문 목록
      </button>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-900">주문 상세</h1>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-error-600 mb-4">{{ error }}</p>
      <UiButton variant="outline" @click="fetchOrder">다시 시도</UiButton>
    </div>

    <!-- Content -->
    <template v-else-if="order">
      <!-- Order Summary Card -->
      <UiCard class="mb-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Order Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-xl font-bold text-neutral-900">{{ order.orderNumber }}</h2>
              <UiBadge :variant="statusMap[order.status]?.variant || 'neutral'">
                {{ statusMap[order.status]?.label || order.status }}
              </UiBadge>
            </div>
            <p class="text-sm text-neutral-500">주문일시: {{ formatDate(order.orderedAt) }}</p>
          </div>

          <!-- Amount Summary -->
          <div class="flex gap-6 md:gap-8 text-center">
            <div>
              <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(order.summary?.grandTotal) }}</p>
              <p class="text-sm text-neutral-500">결제금액</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-neutral-900">{{ order.items?.length || 0 }}건</p>
              <p class="text-sm text-neutral-500">주문상품</p>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 주문 회원 정보 -->
        <UiCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-neutral-900">주문 회원 정보</h3>
              <UiButton variant="ghost" size="xs" @click="goToUser(order.customer?.userId)">
                상세보기
              </UiButton>
            </div>
          </template>
          <UiDescriptionList :items="userInfoItems">
            <template #value-name="{ item }">
              {{ item.value }}
              <UiBadge v-if="order.customer?.grade" variant="warning" size="sm" class="ml-2">
                {{ order.customer.grade }}
              </UiBadge>
            </template>
          </UiDescriptionList>
        </UiCard>

        <!-- 결제 정보 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">결제 정보</h3>
          </template>
          <UiDescriptionList :items="paymentInfoItems">
            <template #value-status="{ item }">
              <UiBadge :variant="paymentStatusMap[item.value]?.variant || 'neutral'" size="sm">
                {{ paymentStatusMap[item.value]?.label || item.value }}
              </UiBadge>
            </template>
            <template #value-transactionId="{ item }">
              <span class="font-mono text-xs text-neutral-600">{{ item.value }}</span>
            </template>
          </UiDescriptionList>
        </UiCard>

        <!-- 배송지 정보 -->
        <UiCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-neutral-900">배송지 정보</h3>
              <UiButton variant="primary" size="sm" @click="openStatusModal">
                상태 변경
              </UiButton>
            </div>
          </template>
          <UiDescriptionList :items="shippingInfoItems">
            <template #value-tracking="{ item }">
              <span class="font-mono">{{ item.value }}</span>
            </template>
          </UiDescriptionList>
        </UiCard>
      </div>

      <!-- 주문 상품 목록 -->
      <UiCard class="mb-6" padding="none">
        <template #header>
          <h3 class="font-semibold text-neutral-900 px-4 py-3 border-b border-neutral-200">
            주문 상품 ({{ order.items?.length || 0 }}건)
          </h3>
        </template>

        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-neutral-200 bg-neutral-50">
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">상품정보</th>
                <th class="text-center py-3 px-4 text-sm font-medium text-neutral-600 w-24">수량</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 w-32">단가</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600 w-32">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in order.items"
                :key="index"
                class="border-b border-neutral-100"
              >
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        v-if="item.imageUrl"
                        :src="item.imageUrl"
                        :alt="item.productName"
                        class="w-full h-full object-cover"
                      >
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-neutral-900">{{ item.productName }}</p>
                      <p v-if="item.variantName" class="text-xs text-neutral-500">{{ item.variantName }}</p>
                      <p v-if="item.options?.length" class="text-xs text-neutral-500">
                        {{ item.options.join(' / ') }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 text-center text-sm text-neutral-700">{{ item.quantity }}</td>
                <td class="py-4 px-4 text-right text-sm text-neutral-600">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="py-4 px-4 text-right text-sm font-medium text-neutral-900">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y divide-neutral-100">
          <div
            v-for="(item, index) in order.items"
            :key="index"
            class="p-4"
          >
            <div class="flex gap-3">
              <div class="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.productName"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-900">{{ item.productName }}</p>
                <p v-if="item.variantName" class="text-xs text-neutral-500">{{ item.variantName }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-neutral-600">{{ item.quantity }}개 x {{ formatCurrency(item.unitPrice) }}</span>
                  <span class="text-sm font-semibold text-neutral-900">{{ formatCurrency(item.subtotal) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Summary -->
        <div class="border-t border-neutral-200 bg-neutral-50 p-4">
          <dl class="space-y-2 max-w-xs ml-auto">
            <div class="flex justify-between text-sm">
              <dt class="text-neutral-500">상품 합계</dt>
              <dd class="text-neutral-900">{{ formatCurrency(order.summary?.subtotal) }}</dd>
            </div>
            <div v-if="order.summary?.discountTotal > 0" class="flex justify-between text-sm">
              <dt class="text-neutral-500">할인</dt>
              <dd class="text-error-600">-{{ formatCurrency(order.summary.discountTotal) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-neutral-500">배송비</dt>
              <dd class="text-neutral-900">
                {{ order.summary?.shippingTotal === 0 ? '무료' : formatCurrency(order.summary?.shippingTotal) }}
              </dd>
            </div>
            <div class="flex justify-between pt-2 border-t border-neutral-300">
              <dt class="text-base font-semibold text-neutral-900">결제 금액</dt>
              <dd class="text-lg font-bold text-primary-600">{{ formatCurrency(order.summary?.grandTotal) }}</dd>
            </div>
          </dl>
        </div>
      </UiCard>

      <!-- 주문 이력 -->
      <UiCard v-if="order.history?.length">
        <template #header>
          <h3 class="font-semibold text-neutral-900">주문 이력</h3>
        </template>
        <ul class="space-y-6">
          <li
            v-for="(history, index) in order.history"
            :key="index"
            class="relative flex gap-4"
          >
            <!-- 아이콘 + 세로선 -->
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-100 flex-shrink-0" />
              <div
                v-if="index < order.history.length - 1"
                class="w-0.5 flex-1 bg-neutral-200 mt-2"
              />
            </div>
            <!-- 내용 -->
            <div class="flex-1 pb-2">
              <p class="text-sm font-medium text-neutral-900">
                {{ history.fromStatus ? `${statusMap[history.fromStatus]?.label || history.fromStatus} → ` : '' }}
                {{ statusMap[history.toStatus]?.label || history.toStatus }}
              </p>
              <p class="text-xs text-neutral-500">
                {{ formatDate(history.createdAt) }}
                <span v-if="history.createdByName"> · {{ history.createdByName }}</span>
              </p>
              <p v-if="history.reason" class="text-sm text-neutral-600 mt-1">{{ history.reason }}</p>
            </div>
          </li>
        </ul>
      </UiCard>
    </template>

    <!-- Not Found -->
    <UiCard v-else>
      <UiEmpty
        title="주문을 찾을 수 없습니다"
        description="존재하지 않거나 삭제된 주문입니다."
      >
        <template #action>
          <UiButton variant="primary" @click="goBack">
            목록으로 돌아가기
          </UiButton>
        </template>
      </UiEmpty>
    </UiCard>

    <!-- Status Change Modal -->
    <UiModal
      v-model="showStatusModal"
      title="주문 상태 변경"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        주문 <span class="font-medium text-neutral-900">{{ order?.orderNumber }}</span>의 상태를 변경합니다.
      </p>

      <div class="space-y-2">
        <label
          v-for="option in statusOptions"
          :key="option.value"
          :class="[
            'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
            selectedStatus === option.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-neutral-300',
          ]"
        >
          <input
            v-model="selectedStatus"
            type="radio"
            :value="option.value"
            class="w-4 h-4 text-primary-600 focus:ring-primary-500"
          >
          <span class="font-medium">{{ option.label }}</span>
          <UiBadge :variant="statusMap[option.value]?.variant" size="sm" class="ml-auto">
            {{ option.label }}
          </UiBadge>
        </label>
      </div>

      <!-- 배송중 선택 시 송장번호 입력 -->
      <div v-if="isShippingSelected" class="mt-4 p-4 bg-neutral-50 rounded-lg space-y-3">
        <p class="text-sm font-medium text-neutral-700">송장 정보 입력</p>
        <div>
          <label class="block text-sm text-neutral-600 mb-1">택배사 <span class="text-error-500">*</span></label>
          <select
            v-model="selectedCarrierId"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">택배사 선택</option>
            <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.id">
              {{ carrier.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-neutral-600 mb-1">송장번호 <span class="text-error-500">*</span></label>
          <input
            v-model="trackingNumber"
            type="text"
            placeholder="송장번호를 입력하세요"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
        <p v-if="!selectedCarrierId || !trackingNumber.trim()" class="text-xs text-error-500">
          배송중 상태로 변경하려면 택배사와 송장번호를 입력해야 합니다.
        </p>
      </div>

      <!-- 변경 사유 -->
      <div class="mt-4">
        <label class="block text-sm text-neutral-600 mb-1">변경 사유</label>
        <input
          v-model="statusReason"
          type="text"
          placeholder="변경 사유를 입력하세요 (선택)"
          class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton
            variant="outline"
            :disabled="isChangingStatus"
            @click="showStatusModal = false"
          >
            취소
          </UiButton>
          <UiButton
            variant="primary"
            :disabled="!canChangeStatus"
            :loading="isChangingStatus"
            @click="handleStatusChange"
          >
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutDetailPage>
</template>
