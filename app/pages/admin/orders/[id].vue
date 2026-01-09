<script setup>
/**
 * 주문 상세 페이지
 * - 주문 회원 정보
 * - 결제 정보
 * - 배송지 정보
 * - 주문 상품 정보
 * - 쿠폰/적립금 사용 정보
 * - 관리자 메모
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const orderId = computed(() => route.params.id)

// 로딩 상태
const isLoading = ref(true)
const isSavingMemo = ref(false)

// 주문 정보
const order = ref(null)

// 메모 히스토리
const memos = ref([])

// 주문 상태 매핑
const statusMap = {
  pending: { label: '결제대기', variant: 'warning' },
  paid: { label: '결제완료', variant: 'info' },
  preparing: { label: '상품준비중', variant: 'primary' },
  shipping: { label: '배송중', variant: 'info' },
  delivered: { label: '배송완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'error' },
}

// 결제 수단 매핑
const paymentMethodMap = {
  card: '신용카드',
  bank: '무통장입금',
  kakao: '카카오페이',
  naver: '네이버페이',
  toss: '토스페이',
}

// 결제 상태 매핑
const paymentStatusMap = {
  pending: { label: '결제대기', variant: 'warning' },
  completed: { label: '결제완료', variant: 'success' },
  failed: { label: '결제실패', variant: 'error' },
  refunded: { label: '환불완료', variant: 'neutral' },
}

// 택배사 옵션
const carrierOptions = [
  { value: 'cj', label: 'CJ대한통운' },
  { value: 'hanjin', label: '한진택배' },
  { value: 'lotte', label: '롯데택배' },
  { value: 'logen', label: '로젠택배' },
  { value: 'post', label: '우체국택배' },
  { value: 'gs', label: 'GS postbox' },
  { value: 'etc', label: '기타' },
]

// Mock 데이터 로드
onMounted(() => {
  setTimeout(() => {
    order.value = {
      id: orderId.value,
      orderNo: 'ORD20250108001',
      status: 'paid',
      createdAt: '2025-01-08 14:30:25',

      // 회원 정보
      user: {
        id: 'user001',
        name: '김철수',
        phone: '010-1234-5678',
        email: 'kim@example.com',
        grade: 'VIP',
      },

      // 결제 정보
      payment: {
        method: 'card',
        cardName: '삼성카드',
        cardNumber: '**** **** **** 1234',
        installment: '일시불',
        status: 'completed',
        paidAt: '2025-01-08 14:32:10',
        transactionId: 'TXN20250108143210001',
      },

      // 배송지 정보
      shipping: {
        recipientName: '김철수',
        recipientPhone: '010-1234-5678',
        zipcode: '06234',
        address1: '서울시 강남구 테헤란로 123',
        address2: '456호',
        memo: '부재 시 경비실에 맡겨주세요',
        trackingNumber: '',
        carrier: '',
      },

      // 주문 상품
      items: [
        {
          id: 1,
          productId: 'PROD001',
          productName: '겨울 패딩 자켓 프리미엄',
          option: '블랙 / XL',
          quantity: 1,
          unitPrice: 129000,
          totalPrice: 129000,
          imageUrl: '',
        },
        {
          id: 2,
          productId: 'PROD002',
          productName: '울 니트 스웨터',
          option: '그레이 / L',
          quantity: 2,
          unitPrice: 59000,
          totalPrice: 118000,
        },
        {
          id: 3,
          productId: 'PROD003',
          productName: '캐시미어 머플러',
          option: '네이비',
          quantity: 1,
          unitPrice: 45000,
          totalPrice: 45000,
        },
      ],

      // 금액 정보
      amounts: {
        productTotal: 292000,    // 상품 합계
        shippingFee: 0,          // 배송비
        couponDiscount: 30000,   // 쿠폰 할인
        pointUsed: 10000,        // 적립금 사용
        totalAmount: 252000,     // 최종 결제금액
      },

      // 쿠폰/적립금 상세
      discount: {
        coupon: {
          code: 'WINTER2025',
          name: '겨울 시즌 할인 쿠폰',
          discountAmount: 30000,
        },
        point: {
          used: 10000,
          earned: 2520, // 결제금액의 1%
        },
      },

      // 주문 이력
      history: [
        { date: '2025-01-08 14:30:25', action: '주문 생성', description: '주문이 접수되었습니다.' },
        { date: '2025-01-08 14:32:10', action: '결제 완료', description: '신용카드 결제가 완료되었습니다.' },
      ],
    }

    // 메모 히스토리 (Mock 데이터)
    memos.value = [
      {
        id: 1,
        content: 'VIP 고객, 포장 신경 써주세요.',
        adminId: 'admin001',
        adminName: '김관리',
        createdAt: '2025-01-08 15:00:00',
      },
      {
        id: 2,
        content: '고객 요청으로 선물 포장 추가함',
        adminId: 'admin002',
        adminName: '이담당',
        createdAt: '2025-01-08 16:30:00',
      },
    ]

    isLoading.value = false
  }, 500)
})

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 택배사 라벨 가져오기
const getCarrierLabel = (carrier) => {
  return carrierOptions.find(c => c.value === carrier)?.label || carrier
}

// 주문 회원 정보 아이템
const userInfoItems = computed(() => {
  if (!order.value) return []
  return [
    { key: 'userId', label: '유저ID', value: order.value.user.id },
    { key: 'name', label: '이름', value: order.value.user.name },
    { key: 'phone', label: '연락처', value: order.value.user.phone },
    { key: 'email', label: '이메일', value: order.value.user.email },
  ]
})

// 결제 정보 아이템
const paymentInfoItems = computed(() => {
  if (!order.value) return []
  const p = order.value.payment
  return [
    { key: 'method', label: '결제수단', value: paymentMethodMap[p.method] || p.method },
    { key: 'card', label: '카드정보', value: `${p.cardName} (${p.cardNumber})`, show: !!p.cardName },
    { key: 'installment', label: '할부', value: p.installment, show: !!p.installment },
    { key: 'status', label: '결제상태', value: p.status },
    { key: 'paidAt', label: '결제일시', value: p.paidAt || '-' },
    { key: 'transactionId', label: '거래번호', value: p.transactionId },
  ]
})

// 배송지 정보 아이템
const shippingInfoItems = computed(() => {
  if (!order.value) return []
  const s = order.value.shipping
  return [
    { key: 'recipientName', label: '수령인', value: s.recipientName },
    { key: 'recipientPhone', label: '연락처', value: s.recipientPhone },
    { key: 'zipcode', label: '우편번호', value: s.zipcode },
    { key: 'address', label: '주소', value: s.address1 },
    { key: 'memo', label: '배송메모', value: s.memo, show: !!s.memo },
    { key: 'tracking', label: '운송장', value: s.trackingNumber, show: !!s.trackingNumber },
  ]
})

// 목록으로 돌아가기
const goBack = () => {
  router.push('/admin/orders')
}

// 회원 상세로 이동
const goToUser = (userId) => {
  router.push(`/admin/users/${userId}`)
}

// 메모 추가
const handleAddMemo = async (memoData) => {
  isSavingMemo.value = true

  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newMemo = {
    id: Date.now(),
    content: memoData.content,
    adminId: memoData.adminId,
    adminName: memoData.adminName,
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  }

  // 최신순으로 맨 앞에 추가
  memos.value = [newMemo, ...memos.value]
  isSavingMemo.value = false

  uiStore.showToast({
    type: 'success',
    message: '메모가 등록되었습니다.',
  })
}

// 메모 수정
const handleEditMemo = async (memoData) => {
  isSavingMemo.value = true

  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 500))

  const index = memos.value.findIndex((m) => m.id === memoData.id)
  if (index > -1) {
    memos.value[index] = {
      ...memos.value[index],
      content: memoData.content,
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
  }

  isSavingMemo.value = false

  uiStore.showToast({
    type: 'success',
    message: '메모가 수정되었습니다.',
  })
}

// 메모 삭제
const handleDeleteMemo = async (memoId) => {
  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 300))

  memos.value = memos.value.filter((m) => m.id !== memoId)

  uiStore.showToast({
    type: 'success',
    message: '메모가 삭제되었습니다.',
  })
}

// 상태 변경
const showStatusModal = ref(false)
const selectedStatus = ref('')
const trackingCarrier = ref('')
const trackingNumber = ref('')

const statusOptions = [
  { value: 'pending', label: '결제대기' },
  { value: 'paid', label: '결제완료' },
  { value: 'preparing', label: '상품준비중' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송완료' },
  { value: 'cancelled', label: '취소' },
]

// 배송중 상태에서 송장번호 필수 여부
const isShippingSelected = computed(() => selectedStatus.value === 'shipping')
const canChangeStatus = computed(() => {
  if (!selectedStatus.value || selectedStatus.value === order.value?.status) return false
  if (isShippingSelected.value && (!trackingCarrier.value || !trackingNumber.value.trim())) return false
  return true
})

const openStatusModal = () => {
  selectedStatus.value = order.value.status
  trackingCarrier.value = order.value.shipping.carrier || ''
  trackingNumber.value = order.value.shipping.trackingNumber || ''
  showStatusModal.value = true
}

const handleStatusChange = async () => {
  if (!canChangeStatus.value) return

  // 실제로는 API 호출
  order.value.status = selectedStatus.value

  // 배송중 상태로 변경 시 송장번호 저장
  if (selectedStatus.value === 'shipping') {
    order.value.shipping.carrier = trackingCarrier.value
    order.value.shipping.trackingNumber = trackingNumber.value
  }

  showStatusModal.value = false

  uiStore.showToast({
    type: 'success',
    message: '주문 상태가 변경되었습니다.',
  })
}
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
        <UiButton v-if="order" variant="outline" size="sm" @click="openStatusModal">
          상태 변경
        </UiButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Content -->
    <template v-else-if="order">
      <!-- Order Summary Card -->
      <UiCard class="mb-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Order Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-xl font-bold text-neutral-900">{{ order.orderNo }}</h2>
              <UiBadge :variant="statusMap[order.status]?.variant || 'neutral'">
                {{ statusMap[order.status]?.label || order.status }}
              </UiBadge>
            </div>
            <p class="text-sm text-neutral-500">주문일시: {{ order.createdAt }}</p>
          </div>

          <!-- Amount Summary -->
          <div class="flex gap-6 md:gap-8 text-center">
            <div>
              <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(order.amounts.totalAmount) }}</p>
              <p class="text-sm text-neutral-500">결제금액</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-neutral-900">{{ order.items.length }}건</p>
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
              <UiButton variant="ghost" size="xs" @click="goToUser(order.user.id)">
                상세보기
              </UiButton>
            </div>
          </template>
          <UiDescriptionList :items="userInfoItems">
            <template #value-name="{ item }">
              {{ item.value }}
              <UiBadge v-if="order.user.grade" variant="warning" size="sm" class="ml-2">{{ order.user.grade }}</UiBadge>
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
            <h3 class="font-semibold text-neutral-900">배송지 정보</h3>
          </template>
          <UiDescriptionList :items="shippingInfoItems">
            <template #value-address>
              {{ order.shipping.address1 }}
              <span v-if="order.shipping.address2" class="block">{{ order.shipping.address2 }}</span>
            </template>
            <template #value-tracking>
              {{ getCarrierLabel(order.shipping.carrier) }}
              <span class="font-mono ml-1">{{ order.shipping.trackingNumber }}</span>
            </template>
          </UiDescriptionList>
        </UiCard>

        <!-- 쿠폰/적립금 정보 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">할인/적립금 정보</h3>
          </template>
          <dl class="space-y-3">
            <div v-if="order.discount.coupon" class="flex justify-between">
              <dt class="text-sm text-neutral-500">쿠폰 할인</dt>
              <dd class="text-sm">
                <span class="text-error-600 font-medium">-{{ formatCurrency(order.discount.coupon.discountAmount) }}</span>
                <span class="text-xs text-neutral-500 block">{{ order.discount.coupon.name }} ({{ order.discount.coupon.code }})</span>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-neutral-500">적립금 사용</dt>
              <dd class="text-sm">
                <span v-if="order.discount.point.used > 0" class="text-error-600 font-medium">-{{ formatCurrency(order.discount.point.used) }}</span>
                <span v-else class="text-neutral-400">-</span>
              </dd>
            </div>
            <div class="flex justify-between pt-3 border-t border-neutral-200">
              <dt class="text-sm text-neutral-500">적립 예정</dt>
              <dd class="text-sm text-primary-600 font-medium">+{{ formatCurrency(order.discount.point.earned) }}</dd>
            </div>
          </dl>
        </UiCard>
      </div>

      <!-- 주문 상품 목록 -->
      <UiCard class="mb-6" padding="none">
        <template #header>
          <h3 class="font-semibold text-neutral-900 px-4 py-3 border-b border-neutral-200">주문 상품 ({{ order.items.length }}건)</h3>
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
                v-for="item in order.items"
                :key="item.id"
                class="border-b border-neutral-100"
              >
                <td class="py-4 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-neutral-900">{{ item.productName }}</p>
                      <p class="text-xs text-neutral-500">{{ item.option }}</p>
                      <p class="text-xs text-neutral-400">{{ item.productId }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 text-center text-sm text-neutral-700">{{ item.quantity }}</td>
                <td class="py-4 px-4 text-right text-sm text-neutral-600">{{ formatCurrency(item.unitPrice) }}</td>
                <td class="py-4 px-4 text-right text-sm font-medium text-neutral-900">{{ formatCurrency(item.totalPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y divide-neutral-100">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="p-4"
          >
            <div class="flex gap-3">
              <div class="w-16 h-16 bg-neutral-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-900">{{ item.productName }}</p>
                <p class="text-xs text-neutral-500">{{ item.option }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-sm text-neutral-600">{{ item.quantity }}개 x {{ formatCurrency(item.unitPrice) }}</span>
                  <span class="text-sm font-semibold text-neutral-900">{{ formatCurrency(item.totalPrice) }}</span>
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
              <dd class="text-neutral-900">{{ formatCurrency(order.amounts.productTotal) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-neutral-500">배송비</dt>
              <dd class="text-neutral-900">{{ order.amounts.shippingFee === 0 ? '무료' : formatCurrency(order.amounts.shippingFee) }}</dd>
            </div>
            <div v-if="order.amounts.couponDiscount > 0" class="flex justify-between text-sm">
              <dt class="text-neutral-500">쿠폰 할인</dt>
              <dd class="text-error-600">-{{ formatCurrency(order.amounts.couponDiscount) }}</dd>
            </div>
            <div v-if="order.amounts.pointUsed > 0" class="flex justify-between text-sm">
              <dt class="text-neutral-500">적립금 사용</dt>
              <dd class="text-error-600">-{{ formatCurrency(order.amounts.pointUsed) }}</dd>
            </div>
            <div class="flex justify-between pt-2 border-t border-neutral-300">
              <dt class="text-base font-semibold text-neutral-900">결제 금액</dt>
              <dd class="text-lg font-bold text-primary-600">{{ formatCurrency(order.amounts.totalAmount) }}</dd>
            </div>
          </dl>
        </div>
      </UiCard>

      <!-- 관리자 메모 히스토리 -->
      <UiCard class="mb-6">
        <template #header>
          <h3 class="font-semibold text-neutral-900">관리자 메모</h3>
        </template>
        <DomainMemoHistory
          :memos="memos"
          :is-saving="isSavingMemo"
          current-admin-id="admin001"
          current-admin-name="김관리"
          placeholder="주문에 대한 메모를 남겨주세요..."
          @add="handleAddMemo"
          @edit="handleEditMemo"
          @delete="handleDeleteMemo"
        />
      </UiCard>

      <!-- 주문 이력 -->
      <UiCard>
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
              <p class="text-sm font-medium text-neutral-900">{{ history.action }}</p>
              <p class="text-xs text-neutral-500">{{ history.date }}</p>
              <p class="text-sm text-neutral-600 mt-1">{{ history.description }}</p>
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
        주문 <span class="font-medium text-neutral-900">{{ order?.orderNo }}</span>의 상태를 변경합니다.
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
            v-model="trackingCarrier"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">택배사 선택</option>
            <option v-for="carrier in carrierOptions" :key="carrier.value" :value="carrier.value">
              {{ carrier.label }}
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
        <p v-if="!trackingCarrier || !trackingNumber.trim()" class="text-xs text-error-500">
          배송중 상태로 변경하려면 택배사와 송장번호를 입력해야 합니다.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton
            variant="outline"
            @click="showStatusModal = false"
          >
            취소
          </UiButton>
          <UiButton
            variant="primary"
            :disabled="!canChangeStatus"
            @click="handleStatusChange"
          >
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutDetailPage>
</template>
