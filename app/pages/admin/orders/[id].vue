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
import { useCatalogStore } from '~/stores/catalog'
import { formatCurrency, formatDate } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const uiStore = useUiStore()
const catalogStore = useCatalogStore()

const orderId = computed(() => route.params.id)

// 로딩 상태
const isLoading = ref(true)
const error = ref(null)
const isChangingStatus = ref(false)
const isRefreshingDelivery = ref(false)

// 주문 정보
const order = ref(null)

// 택배사 목록 (스토어에서 가져옴)
const carriers = computed(() => catalogStore.carriers)

// 주문 상태 매핑
const statusMap = {
  PENDING: { label: '결제대기', variant: 'neutral' },
  PAID: { label: '주문완료', variant: 'primary' },
  PREPARING: { label: '상품준비중', variant: 'warning' },
  SHIPPING: { label: '배송중', variant: 'info' },
  DELIVERED: { label: '배송완료', variant: 'success' },
  CONFIRMED: { label: '구매확정', variant: 'success' },
  RETURN_REQUESTED: { label: '반품요청', variant: 'warning' },
  EXCHANGE_REQUESTED: { label: '교환요청', variant: 'warning' },
  CANCELLED: { label: '주문취소', variant: 'success' },
  REFUNDED: { label: '환불완료', variant: 'error' },
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
const allStatusOptions = [
  { value: 'PENDING', label: '결제대기' },
  { value: 'PAID', label: '주문완료' },
  { value: 'PREPARING', label: '상품준비중' },
  { value: 'SHIPPING', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CANCELLED', label: '취소' },
  { value: 'REFUNDED', label: '환불' },
]

// 상태별 허용 전이 규칙
// - 취소: 상품준비중 전까지만 가능 (배송 프로세스 시작 전)
// - 환불: 배송완료 후에도 가능 (반품 후 환불)
// - 상품준비중 이후: 순방향 진행 + 환불만 가능 (역방향 불가)
const allowedTransitions = {
  PENDING: ['PAID', 'CANCELLED'],           // 결제대기 → 주문완료, 취소
  PAID: ['PREPARING', 'CANCELLED', 'REFUNDED'], // 주문완료 → 상품준비중, 취소, 환불
  PREPARING: ['SHIPPING', 'DELIVERED'],     // 상품준비중 → 배송중, 배송완료 (취소 불가, 환불은 배송완료 후)
  SHIPPING: ['DELIVERED'],                  // 배송중 → 배송완료만 가능
  DELIVERED: ['REFUNDED'],                  // 배송완료 → 환불 가능 (반품 처리)
  CANCELLED: [],                            // 취소 → 변경 불가
  REFUNDED: [],                             // 환불 → 변경 불가
}

// 현재 상태에서 변경 가능한 상태 옵션
const statusOptions = computed(() => {
  const currentStatus = order.value?.status
  if (!currentStatus) return []

  const allowed = allowedTransitions[currentStatus] || []
  return allStatusOptions.filter(opt => allowed.includes(opt.value))
})

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

// 진입 경로 판별
const fromClaims = computed(() => route.query.from === 'claims')

// 클레임 정보
const claimTypeMap = {
  CANCEL: { label: '취소', variant: 'neutral' },
  EXCHANGE: { label: '교환', variant: 'warning' },
  RETURN: { label: '반품', variant: 'error' },
}
const claimStatusMap = {
  REQUESTED: { label: '요청', variant: 'warning' },
  APPROVED: { label: '승인', variant: 'info' },
  IN_PROGRESS: { label: '진행중', variant: 'info' },
  COMPLETED: { label: '완료', variant: 'success' },
  REJECTED: { label: '거절', variant: 'error' },
}
const reasonTypeMap = {
  DEFECTIVE: '불량',
  WRONG_DELIVERY: '오배송',
  DELAYED_DELIVERY: '배송지연',
  CHANGE_OF_MIND: '단순변심',
  INCOMPATIBILITY: '호환성문제',
  OTHER: '기타',
}
const claimId = computed(() => route.query.claimId)
const claimType = computed(() => route.query.claimType)
const claimStatus = computed(() => route.query.claimStatus)

// 클레임 상세 정보 (API에서 가져옴)
const claimDetail = ref(null)
const isClaimLoading = ref(false)

const fetchClaimDetail = async () => {
  if (!orderId.value) return
  isClaimLoading.value = true
  try {
    const response = await $api.get(`/admin/claims/orders/${orderId.value}`)
    const data = response.data?.data || response.data
    // 배열로 오는 경우 첫 번째 항목 사용
    claimDetail.value = Array.isArray(data) ? data[0] : data
  } catch (err) {
    console.error('Claim detail fetch error:', err)
  } finally {
    isClaimLoading.value = false
  }
}

// 클레임 정보 표시용 computed
const claimInfoItems = computed(() => {
  const detail = claimDetail.value
  if (!detail) return []

  const items = [
    { key: 'claimType', label: '유형', value: detail.claimType },
    { key: 'claimStatus', label: '상태', value: detail.status },
    { key: 'claimItems', label: '대상 상품', value: detail.items || [] },
    { key: 'reasonType', label: '사유 유형', value: reasonTypeMap[detail.reasonType] || detail.reasonType || '-' },
    { key: 'reason', label: '상세 사유', value: detail.reason || '-' },
    { key: 'requestedAt', label: '접수 일시', value: formatDate(detail.requestedAt, 'long') },
    { key: 'refundAmount', label: '환불 금액', value: detail.refundAmount != null ? formatCurrency(detail.refundAmount) : '-' },
  ]

  // 실제 환불 금액 (환불 완료 후에만 표시)
  if (detail.actualRefundAmount != null) {
    items.push({
      key: 'actualRefundAmount',
      label: '환불 완료',
      value: formatCurrency(detail.actualRefundAmount),
    })
  }

  // 회수 배송 정보
  if (detail.returnTrackingNumber) {
    items.push({
      key: 'returnShipping',
      label: '반송 정보',
      value: `${detail.returnTrackingNumber}`,
      url: detail.returnTrackingUrl || null,
    })
  }

  // 교환 재발송 정보 (REJECTED일 때는 "재배송", 그 외는 "교환 배송")
  if (detail.exchangeTrackingNumber) {
    items.push({
      key: 'exchangeShipping',
      label: detail.status === 'REJECTED' ? '재배송' : '교환 배송',
      value: `${detail.exchangeTrackingNumber}`,
      url: detail.exchangeTrackingUrl || null,
    })
  }

  if (detail.adminNote) {
    items.push({ key: 'adminNote', label: '관리자 메모', value: detail.adminNote })
  }

  if (detail.rejectReason) {
    items.push({ key: 'rejectReason', label: '거절 사유', value: detail.rejectReason })
  }

  return items
})

// 목록으로 돌아가기
const goBack = () => {
  router.push(fromClaims.value ? '/admin/orders/claims' : '/admin/orders')
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
const showConfirmStep = ref(false) // 확인 단계 표시 여부

// 배송중 상태에서 송장번호 필수 여부
const isShippingSelected = computed(() => selectedStatus.value === 'SHIPPING')
const isRefundSelected = computed(() => selectedStatus.value === 'REFUNDED')
const refundReason = ref('')
const refundAmount = ref('')
const canChangeStatus = computed(() => {
  if (!selectedStatus.value || selectedStatus.value === order.value?.status) return false
  if (isShippingSelected.value && (!selectedCarrierId.value || !trackingNumber.value.trim())) return false
  if (isRefundSelected.value && !refundReason.value.trim()) return false
  return true
})

// 상태 변경 가능 여부
const canOpenStatusModal = computed(() => {
  return statusOptions.value.length > 0
})

// 상태 변경 불가 사유 메시지
const getStatusChangeBlockedMessage = () => {
  const currentStatus = order.value?.status
  if (currentStatus === 'DELIVERED') {
    return '배송완료 상태에서는 상태를 변경할 수 없습니다.\n환불이 필요하면 별도로 환불 처리를 진행해 주세요.'
  }
  if (currentStatus === 'CANCELLED') {
    return '취소된 주문은 상태를 변경할 수 없습니다.'
  }
  if (currentStatus === 'REFUNDED') {
    return '환불된 주문은 상태를 변경할 수 없습니다.'
  }
  return '현재 상태에서는 변경할 수 있는 상태가 없습니다.'
}

const openStatusModal = () => {
  // 변경 가능한 상태가 없으면 안내 모달 표시
  if (!canOpenStatusModal.value) {
    showStatusModal.value = true
    return
  }

  // 첫 번째 옵션을 기본 선택
  selectedStatus.value = statusOptions.value[0]?.value || ''
  statusReason.value = ''
  refundReason.value = ''
  refundAmount.value = ''
  showConfirmStep.value = false // 확인 단계 초기화

  // 기존 배송 정보가 있으면 미리 채워줌
  const shipping = order.value.shipping
  if (shipping?.trackingNumber) {
    trackingNumber.value = shipping.trackingNumber
    // 택배사 ID (API 응답 구조에 따라 carrierId 또는 carrier.id)
    selectedCarrierId.value = shipping.carrierId || shipping.carrier?.id || ''
  } else {
    trackingNumber.value = ''
    selectedCarrierId.value = ''
  }

  showStatusModal.value = true
}

// 되돌릴 수 없는 상태 변경인지 확인
const isIrreversibleChange = computed(() => {
  // 상품준비중, 배송중, 배송완료, 환불로 변경하는 경우 되돌릴 수 없음
  return ['PREPARING', 'SHIPPING', 'DELIVERED', 'REFUNDED'].includes(selectedStatus.value)
})

// 변경 버튼 클릭 시
const handleChangeClick = () => {
  if (!canChangeStatus.value) return

  // 되돌릴 수 없는 변경인 경우 확인 단계 표시
  if (isIrreversibleChange.value) {
    showConfirmStep.value = true
    return
  }

  // 되돌릴 수 있는 변경은 바로 실행
  executeStatusChange()
}

// 확인 단계에서 뒤로 가기
const goBackFromConfirm = () => {
  showConfirmStep.value = false
}

// 실제 상태 변경 실행
const executeStatusChange = async () => {
  isChangingStatus.value = true

  try {
    if (isRefundSelected.value) {
      // 환불 처리는 별도 API
      const refundPayload = {
        orderId: Number(orderId.value),
        claimId: claimId.value ? Number(claimId.value) : undefined,
        reason: refundReason.value,
      }
      if (refundAmount.value) {
        refundPayload.amount = Number(refundAmount.value)
      }
      await $api.post('/admin/refunds', refundPayload)
    } else {
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
    }

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

// 배송 정보 갱신
const refreshDelivery = async () => {
  isRefreshingDelivery.value = true

  try {
    await $api.post(`/admin/delivery/track/order/${orderId.value}/refresh`)

    uiStore.showToast({
      type: 'success',
      message: '배송 정보가 갱신되었습니다.',
    })

    // 주문 정보 새로고침
    await fetchOrder()
  } catch (err) {
    console.error('Delivery refresh error:', err)
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || err.message || '배송 정보 갱신에 실패했습니다.',
    })
  } finally {
    isRefreshingDelivery.value = false
  }
}

// 배송 정보 갱신 버튼 표시 여부 (배송중/배송완료 상태에서만)
const canRefreshDelivery = computed(() => {
  return ['SHIPPING', 'DELIVERED'].includes(order.value?.status)
})

// ── 클레임 상태변경 (fromClaims일 때) ──
const showClaimModal = ref(false)
const claimAction = ref('') // 'approve' | 'reject' | 'return-shipping' | 'receive-inspect' | 'exchange-complete' | 'refund'
const claimAdminNote = ref('')
const claimRejectReason = ref('')
const claimShippingCompany = ref('')
const claimTrackingNumber = ref('')
const claimReshipCarrier = ref('')
const claimReshipTrackingNumber = ref('')
const claimReturnShippingCarrier = ref('')
const claimReturnTrackingNumber = ref('')
const claimRefundReason = ref('')
const claimRefundAmount = ref('')
const claimInspectResult = ref('ACCEPT') // 'ACCEPT' | 'REJECT'
const claimRestoreStock = ref(true) // true: 재고 복구, false: 복구 안 함
const claimInspectRejectReason = ref('')
const isClaimProcessing = ref(false)

// 클레임 모달에서 가능한 액션 (claimDetail 기반)
const claimAvailableActions = computed(() => {
  const detail = claimDetail.value
  const status = detail?.status || claimStatus.value
  const type = detail?.claimType || claimType.value

  // ── 취소 ──
  if (type === 'CANCEL') {
    if (status === 'REQUESTED') {
      return [
        { value: 'approve', label: '취소 승인', variant: 'success', description: '취소를 승인합니다. 재고가 복구됩니다.' },
        { value: 'reject', label: '취소 거절', variant: 'error', description: '취소 요청을 거절합니다.' },
      ]
    }
    if (status === 'APPROVED') {
      return [
        { value: 'refund', label: '환불 처리', variant: 'error', description: '환불을 진행합니다.' },
      ]
    }
    return []
  }

  // ── 교환/반품 ──
  const hasReturnShipping = detail?.returnShippingCarrier && detail?.returnTrackingNumber

  // REQUESTED: 반송장 미등록 시에만 반송장 등록 + 승인/거절
  if (status === 'REQUESTED' && type === 'EXCHANGE') {
    const actions = []
    if (!hasReturnShipping) {
      actions.push({ value: 'return-shipping', label: '반송장 등록', variant: 'info', description: '고객이 반송할 택배사와 송장번호를 등록합니다.' })
    }
    actions.push(
      { value: 'approve', label: '교환 승인', variant: 'success', description: '승인 후 입고 검수를 진행합니다.' },
      { value: 'reject', label: '교환 거절', variant: 'error', description: '교환 요청을 거절합니다.' },
    )
    return actions
  }
  if (status === 'REQUESTED' && type === 'RETURN') {
    const actions = []
    if (!hasReturnShipping) {
      actions.push({ value: 'return-shipping', label: '반송장 등록', variant: 'info', description: '고객이 반송할 택배사와 송장번호를 등록합니다.' })
    }
    actions.push(
      { value: 'approve', label: '반품 승인', variant: 'success', description: '승인 후 입고 검수를 진행합니다.' },
      { value: 'reject', label: '반품 거절', variant: 'error', description: '반품 요청을 거절합니다.' },
    )
    return actions
  }
  // APPROVED: 입고 검수 + 반송장 미등록 시에만 반송장 등록
  if (status === 'APPROVED' && (type === 'EXCHANGE' || type === 'RETURN')) {
    const actions = []
    if (!hasReturnShipping) {
      actions.push({ value: 'return-shipping', label: '반송장 등록', variant: 'info', description: '고객이 반송할 택배사와 송장번호를 등록합니다.' })
    }
    actions.push({ value: 'receive-inspect', label: '입고 검수', variant: 'primary', description: '반송 상품을 검수하고 승인 또는 거절합니다.' })
    return actions
  }
  // IN_PROGRESS: 교환 → 교환완료 or 환불 / 반품 → 환불
  if (status === 'IN_PROGRESS' && type === 'EXCHANGE') {
    return [
      { value: 'exchange-complete', label: '교환 완료 (송장 입력)', variant: 'primary', description: '교환 상품의 택배사와 송장번호를 입력합니다.' },
      { value: 'refund', label: '환불 처리', variant: 'error', description: '교환 대신 환불을 진행합니다.' },
    ]
  }
  if (status === 'IN_PROGRESS' && type === 'RETURN') {
    return [
      { value: 'refund', label: '환불 처리', variant: 'error', description: '환불을 진행합니다. 미입력 시 전액 환불됩니다.' },
    ]
  }
  // REJECTED: 재배송 송장 미등록 시에만 재배송 송장 등록
  if (status === 'REJECTED' && (type === 'RETURN' || type === 'EXCHANGE')) {
    const hasReshipShipping = detail?.exchangeTrackingNumber
    if (!hasReshipShipping) {
      return [
        { value: 'reship', label: '재배송 송장 등록', variant: 'info', description: '거절된 상품을 고객에게 재배송합니다.' },
      ]
    }
    return []
  }
  return []
})

const canOpenClaimModal = computed(() => claimAvailableActions.value.length > 0)

// 클레임 액션 실행 가능 여부
const canExecuteClaim = computed(() => {
  if (!claimAction.value) return false
  if (claimAction.value === 'reject' && !claimRejectReason.value.trim()) return false
  if (claimAction.value === 'return-shipping' && (!claimReturnShippingCarrier.value || !claimReturnTrackingNumber.value.trim())) return false
  if (claimAction.value === 'exchange-complete' && (!claimShippingCompany.value || !claimTrackingNumber.value.trim())) return false
  if (claimAction.value === 'reship' && (!claimReshipCarrier.value || !claimReshipTrackingNumber.value.trim())) return false
  if (claimAction.value === 'refund' && !claimRefundReason.value.trim()) return false
  if (claimAction.value === 'receive-inspect' && claimInspectResult.value === 'REJECT' && !claimInspectRejectReason.value.trim()) return false
  // approve는 추가 입력 없이 실행 가능
  return true
})

const openClaimModal = () => {
  const actions = claimAvailableActions.value
  // 반송장이 이미 등록된 경우 입고 검수에 포커싱
  const hasReturnShipping = claimDetail.value?.returnShippingCarrier && claimDetail.value?.returnTrackingNumber
  const receiveInspect = actions.find(a => a.value === 'receive-inspect')
  claimAction.value = (hasReturnShipping && receiveInspect) ? 'receive-inspect' : (actions[0]?.value || '')
  claimAdminNote.value = ''
  claimRejectReason.value = ''
  claimShippingCompany.value = ''
  claimTrackingNumber.value = ''
  claimReturnShippingCarrier.value = ''
  claimReturnTrackingNumber.value = ''
  claimRefundReason.value = ''
  claimRefundAmount.value = ''
  claimReshipCarrier.value = ''
  claimReshipTrackingNumber.value = ''
  claimInspectResult.value = 'ACCEPT'
  claimRestoreStock.value = true
  claimInspectRejectReason.value = ''
  showClaimModal.value = true
}

const executeClaimAction = async () => {
  if (!canExecuteClaim.value) return
  isClaimProcessing.value = true

  try {
    const id = claimDetail.value?.claimId || claimId.value

    if (claimAction.value === 'approve') {
      const body = {}
      if (claimAdminNote.value.trim()) body.adminNote = claimAdminNote.value
      await $api.post(`/admin/claims/${id}/approve`, body)
    } else if (claimAction.value === 'reject') {
      await $api.post(`/admin/claims/${id}/reject`, {
        rejectReason: claimRejectReason.value,
      })
    } else if (claimAction.value === 'return-shipping') {
      await $api.post(`/admin/claims/${id}/return-shipping`, {
        shippingCarrier: claimReturnShippingCarrier.value,
        trackingNumber: claimReturnTrackingNumber.value,
      })
    } else if (claimAction.value === 'receive-inspect') {
      const inspectBody = { result: claimInspectResult.value }
      if (claimInspectResult.value === 'ACCEPT') {
        inspectBody.restoreStock = claimRestoreStock.value
      }
      if (claimInspectResult.value === 'REJECT') {
        inspectBody.rejectReason = claimInspectRejectReason.value
      }
      await $api.post(`/admin/claims/${id}/receive-inspect`, inspectBody)
    } else if (claimAction.value === 'exchange-complete') {
      const body = {
        shippingCarrier: claimShippingCompany.value,
        trackingNumber: claimTrackingNumber.value,
      }
      if (claimAdminNote.value.trim()) body.adminNote = claimAdminNote.value
      await $api.post(`/admin/claims/${id}/exchange/complete`, body)
    } else if (claimAction.value === 'reship') {
      await $api.post(`/admin/claims/${id}/reship`, {
        shippingCarrier: claimReshipCarrier.value,
        trackingNumber: claimReshipTrackingNumber.value,
      })
    } else if (claimAction.value === 'refund') {
      const body = {
        claimId: Number(id),
        reason: claimRefundReason.value,
      }
      if (claimRefundAmount.value) body.amount = Number(claimRefundAmount.value)
      await $api.post('/admin/refunds', body)
    }

    showClaimModal.value = false
    uiStore.showToast({ type: 'success', message: '클레임 상태가 변경되었습니다.' })
    await Promise.all([fetchOrder(), fetchClaimDetail()])
  } catch (err) {
    console.error('Claim action error:', err)
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || err.message || '클레임 처리에 실패했습니다.',
    })
  } finally {
    isClaimProcessing.value = false
  }
}

// 초기 로드
onMounted(() => {
  fetchOrder()
  if (fromClaims.value) {
    fetchClaimDetail()
  }
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
        {{ fromClaims ? '교환/반품/취소' : '주문 목록' }}
      </button>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold text-neutral-900">
            {{ fromClaims && claimType ? `${claimTypeMap[claimType]?.label || claimType} 상세` : '주문 상세' }}
          </h1>
        </div>
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

      <!-- 클레임 정보 카드 (클레임에서 진입 시) -->
      <UiCard v-if="fromClaims && claimDetail" class="mb-6">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-neutral-900">클레임 정보</h3>
              <UiBadge :variant="claimTypeMap[claimDetail.claimType]?.variant || 'neutral'" size="sm">
                {{ claimTypeMap[claimDetail.claimType]?.label || claimDetail.claimType }}
              </UiBadge>
            </div>
            <UiButton
              :variant="canOpenClaimModal ? 'primary' : 'outline'"
              size="sm"
              :disabled="!canOpenClaimModal"
              @click="openClaimModal"
            >
              {{ canOpenClaimModal ? '클레임 처리' : '처리 완료' }}
            </UiButton>
          </div>
        </template>
        <UiDescriptionList :items="claimInfoItems">
          <template #value-claimType="{ item }">
            <span class="font-medium">{{ claimTypeMap[item.value]?.label || item.value }}</span>
          </template>
          <template #value-claimStatus="{ item }">
            <UiBadge :variant="claimStatusMap[item.value]?.variant || 'neutral'" size="sm">
              {{ claimStatusMap[item.value]?.label || item.value }}
            </UiBadge>
          </template>
          <template #value-refundAmount="{ item }">
            <span
              :class="claimDetail?.claimType === 'EXCHANGE' && claimDetail?.refundAmount === 0
                ? 'text-sm text-neutral-400'
                : 'text-lg font-bold text-error-500'"
            >{{ item.value }}</span>
          </template>
          <template #value-actualRefundAmount="{ item }">
            <span class="text-lg font-bold text-success-600">{{ item.value }}</span>
          </template>
          <template #value-returnShipping="{ item }">
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="underline text-neutral-700 hover:text-neutral-900">
              {{ item.value }}
            </a>
            <span v-else>{{ item.value }}</span>
          </template>
          <template #value-exchangeShipping="{ item }">
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener" class="underline text-neutral-700 hover:text-neutral-900">
              {{ item.value }}
            </a>
            <span v-else>{{ item.value }}</span>
          </template>
          <template #value-claimItems="{ item }">
            <div v-if="item.value?.length" class="space-y-1">
              <div v-for="(ci, idx) in item.value" :key="idx" class="text-sm text-neutral-700">
                {{ ci.productName }}
                <span v-if="ci.variantName" class="text-neutral-500">({{ ci.variantName }})</span>
                <span class="text-neutral-500"> x {{ ci.quantity }}</span>
              </div>
            </div>
            <span v-else class="text-neutral-400">-</span>
          </template>
        </UiDescriptionList>
      </UiCard>

      <!-- 클레임 정보 로딩 -->
      <div v-else-if="fromClaims && isClaimLoading" class="mb-6 flex items-center justify-center py-8">
        <UiSpinner size="md" />
      </div>

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
              <div class="flex items-center gap-2">
                <UiButton
                  v-if="canRefreshDelivery"
                  variant="outline"
                  size="sm"
                  :loading="isRefreshingDelivery"
                  title="배송 정보 갱신"
                  @click="refreshDelivery"
                >
                  <svg class="w-4 h-4 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span class="hidden md:inline">배송 갱신</span>
                </UiButton>
                <UiButton
                  :variant="canOpenStatusModal ? 'primary' : 'outline'"
                  size="sm"
                  :disabled="!canOpenStatusModal"
                  @click="openStatusModal"
                >
                  {{ canOpenStatusModal ? '상태 변경' : '변경 불가' }}
                </UiButton>
              </div>
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
      :title="showConfirmStep ? '상태 변경 확인' : '주문 상태 변경'"
      size="sm"
    >
      <!-- 확인 단계 -->
      <template v-if="showConfirmStep">
        <div class="text-center py-4">
          <!-- 경고 아이콘 -->
          <div class="mx-auto w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            정말 변경하시겠습니까?
          </h3>

          <p class="text-sm text-neutral-600 mb-4">
            <span class="font-medium text-primary-600">{{ allStatusOptions.find(o => o.value === selectedStatus)?.label }}</span>
            상태로 변경하면<br>
            <span class="text-error-600 font-medium">이전 상태로 되돌릴 수 없습니다.</span>
          </p>

          <div class="bg-neutral-50 rounded-lg p-3 text-left">
            <p class="text-xs text-neutral-500 mb-1">변경 후 문제가 발생하면</p>
            <p class="text-sm text-neutral-700">별도의 <span class="font-medium">환불 처리</span>를 진행해 주세요.</p>
          </div>
        </div>
      </template>

      <!-- 상태 변경 불가 안내 -->
      <template v-else-if="!canOpenStatusModal">
        <div class="text-center py-4">
          <!-- 안내 아이콘 -->
          <div class="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 class="text-lg font-semibold text-neutral-900 mb-2">
            상태 변경 불가
          </h3>

          <p class="text-sm text-neutral-600 whitespace-pre-line">
            {{ getStatusChangeBlockedMessage() }}
          </p>
        </div>
      </template>

      <!-- 상태 선택 단계 -->
      <template v-else>
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

        <!-- 되돌릴 수 없는 상태 변경 경고 -->
        <div v-if="isIrreversibleChange" class="mt-3 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <p class="text-sm text-warning-700">
            <span class="font-medium">주의:</span> 이 상태로 변경하면 이전 상태로 되돌릴 수 없습니다.
          </p>
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

        <!-- 환불 선택 시 환불 정보 입력 -->
        <div v-if="isRefundSelected" class="mt-4 p-4 bg-neutral-50 rounded-lg space-y-3">
          <p class="text-sm font-medium text-neutral-700">환불 정보</p>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">환불 사유 <span class="text-error-500">*</span></label>
            <textarea
              v-model="refundReason"
              rows="2"
              placeholder="환불 사유를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">환불 금액</label>
            <input
              v-model="refundAmount"
              type="number"
              placeholder="미입력 시 전액 환불"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>
        </div>

        <!-- 변경 사유 (환불 제외) -->
        <div v-if="!isRefundSelected" class="mt-4">
          <label class="block text-sm text-neutral-600 mb-1">변경 사유</label>
          <input
            v-model="statusReason"
            type="text"
            placeholder="변경 사유를 입력하세요 (선택)"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
      </template>

      <template #footer>
        <!-- 확인 단계 버튼 -->
        <div v-if="showConfirmStep" class="flex justify-end gap-2">
          <UiButton
            variant="outline"
            :disabled="isChangingStatus"
            @click="goBackFromConfirm"
          >
            뒤로
          </UiButton>
          <UiButton
            variant="error"
            :loading="isChangingStatus"
            @click="executeStatusChange"
          >
            변경 확정
          </UiButton>
        </div>

        <!-- 상태 변경 불가 시 닫기 버튼 -->
        <div v-else-if="!canOpenStatusModal" class="flex justify-end">
          <UiButton
            variant="outline"
            @click="showStatusModal = false"
          >
            닫기
          </UiButton>
        </div>

        <!-- 상태 선택 단계 버튼 -->
        <div v-else class="flex justify-end gap-2">
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
            @click="handleChangeClick"
          >
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Claim Action Modal -->
    <UiModal
      v-model="showClaimModal"
      :title="claimTypeMap[claimType]?.label + ' 처리'"
      size="sm"
    >
      <!-- 변경 불가 -->
      <template v-if="!canOpenClaimModal">
        <div class="text-center py-4">
          <div class="mx-auto w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">처리 불가</h3>
          <p class="text-sm text-neutral-600">현재 상태에서는 처리할 수 있는 액션이 없습니다.</p>
        </div>
      </template>

      <!-- 액션 선택 -->
      <template v-else>
        <p class="text-sm text-neutral-600 mb-4">
          주문 <span class="font-medium text-neutral-900">{{ order?.orderNumber }}</span>
        </p>

        <!-- 액션 라디오 선택 -->
        <div v-if="claimAvailableActions.length > 1" class="space-y-2 mb-4">
          <label
            v-for="action in claimAvailableActions"
            :key="action.value"
            :class="[
              'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
              claimAction === action.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300',
            ]"
          >
            <input
              v-model="claimAction"
              type="radio"
              :value="action.value"
              class="w-4 h-4 text-primary-600 focus:ring-primary-500"
            >
            <div class="flex-1">
              <span class="font-medium">{{ action.label }}</span>
              <p v-if="action.description" class="text-xs text-neutral-500 mt-0.5">{{ action.description }}</p>
            </div>
            <UiBadge :variant="action.variant" size="sm" class="ml-auto flex-shrink-0">
              {{ action.label }}
            </UiBadge>
          </label>
        </div>

        <!-- 단일 액션일 때 제목 표시 -->
        <div v-else class="mb-4">
          <UiBadge :variant="claimAvailableActions[0]?.variant" size="sm">
            {{ claimAvailableActions[0]?.label }}
          </UiBadge>
        </div>

        <!-- 거절 사유 (reject 선택 시) -->
        <div v-if="claimAction === 'reject'" class="space-y-3">
          <div>
            <label class="block text-sm text-neutral-600 mb-1">거절 사유 <span class="text-error-500">*</span></label>
            <textarea
              v-model="claimRejectReason"
              rows="3"
              placeholder="거절 사유를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <!-- 반송장 등록 (return-shipping 선택 시) -->
        <div v-if="claimAction === 'return-shipping'" class="p-4 bg-neutral-50 rounded-lg space-y-3">
          <p class="text-sm font-medium text-neutral-700">반송 택배 정보</p>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">택배사 <span class="text-error-500">*</span></label>
            <select
              v-model="claimReturnShippingCarrier"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">택배사 선택</option>
              <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">
                {{ carrier.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">송장번호 <span class="text-error-500">*</span></label>
            <input
              v-model="claimReturnTrackingNumber"
              type="text"
              placeholder="반송 송장번호를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>
        </div>

        <!-- 입고 검수 (receive-inspect 선택 시) -->
        <div v-if="claimAction === 'receive-inspect'" class="space-y-4">
          <!-- 검수 결과 선택 -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-neutral-700">검수 결과 <span class="text-error-500">*</span></p>
            <div class="flex gap-3">
              <label
                :class="[
                  'flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                  claimInspectResult === 'ACCEPT' ? 'border-success-500 bg-success-50' : 'border-neutral-200 hover:border-neutral-300',
                ]"
              >
                <input v-model="claimInspectResult" type="radio" value="ACCEPT" class="w-4 h-4 text-success-600 focus:ring-success-500">
                <span class="font-medium text-sm">승인</span>
              </label>
              <label
                :class="[
                  'flex-1 flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors',
                  claimInspectResult === 'REJECT' ? 'border-error-500 bg-error-50' : 'border-neutral-200 hover:border-neutral-300',
                ]"
              >
                <input v-model="claimInspectResult" type="radio" value="REJECT" class="w-4 h-4 text-error-600 focus:ring-error-500">
                <span class="font-medium text-sm">거절</span>
              </label>
            </div>
          </div>

          <!-- 승인 시: 재고 복구 여부 -->
          <div v-if="claimInspectResult === 'ACCEPT'" class="p-4 bg-neutral-50 rounded-lg space-y-2">
            <p class="text-sm font-medium text-neutral-700">재고 복구 여부</p>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="claimRestoreStock" type="radio" :value="true" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                <span class="text-sm text-neutral-700">재고 복구</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="claimRestoreStock" type="radio" :value="false" class="w-4 h-4 text-primary-600 focus:ring-primary-500">
                <span class="text-sm text-neutral-700">재고 복구 안 함 (파손 등)</span>
              </label>
            </div>
          </div>

          <!-- 거절 시: 거절 사유 -->
          <div v-if="claimInspectResult === 'REJECT'">
            <label class="block text-sm text-neutral-600 mb-1">거절 사유 <span class="text-error-500">*</span></label>
            <textarea
              v-model="claimInspectRejectReason"
              rows="3"
              placeholder="검수 거절 사유를 입력하세요 (예: 사용 흔적이 있어 반품 불가)"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <!-- 교환 완료 송장 입력 (exchange-complete 선택 시) -->
        <div v-if="claimAction === 'exchange-complete'" class="p-4 bg-neutral-50 rounded-lg space-y-3">
          <p class="text-sm font-medium text-neutral-700">교환 상품 송장 정보</p>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">택배사 <span class="text-error-500">*</span></label>
            <select
              v-model="claimShippingCompany"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">택배사 선택</option>
              <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">
                {{ carrier.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">송장번호 <span class="text-error-500">*</span></label>
            <input
              v-model="claimTrackingNumber"
              type="text"
              placeholder="송장번호를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>
        </div>

        <!-- 재배송 송장 등록 (reship 선택 시) -->
        <div v-if="claimAction === 'reship'" class="p-4 bg-neutral-50 rounded-lg space-y-3">
          <p class="text-sm font-medium text-neutral-700">재배송 송장 정보</p>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">택배사 <span class="text-error-500">*</span></label>
            <select
              v-model="claimReshipCarrier"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">택배사 선택</option>
              <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.name">
                {{ carrier.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">송장번호 <span class="text-error-500">*</span></label>
            <input
              v-model="claimReshipTrackingNumber"
              type="text"
              placeholder="재배송 송장번호를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>
        </div>

        <!-- 환불 정보 (refund 선택 시) -->
        <div v-if="claimAction === 'refund'" class="p-4 bg-neutral-50 rounded-lg space-y-3">
          <p class="text-sm font-medium text-neutral-700">환불 정보</p>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">환불 사유 <span class="text-error-500">*</span></label>
            <textarea
              v-model="claimRefundReason"
              rows="2"
              placeholder="환불 사유를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm text-neutral-600 mb-1">환불 금액</label>
            <input
              v-model="claimRefundAmount"
              type="number"
              :placeholder="claimDetail?.refundAmount != null ? `미입력 시 ${formatCurrency(claimDetail.refundAmount)} 전액 환불` : '미입력 시 전액 환불'"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
            <p v-if="claimDetail?.refundAmount != null" class="mt-1 text-xs text-neutral-500">
              환불 금액: {{ formatCurrency(claimDetail.refundAmount) }}
            </p>
          </div>
        </div>

        <!-- 관리자 메모 (승인/교환완료 시) -->
        <div v-if="!['reject', 'refund'].includes(claimAction)" class="mt-4">
          <label class="block text-sm text-neutral-600 mb-1">관리자 메모</label>
          <input
            v-model="claimAdminNote"
            type="text"
            placeholder="메모를 입력하세요 (선택)"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
        </div>
      </template>

      <template #footer>
        <div v-if="!canOpenClaimModal" class="flex justify-end">
          <UiButton variant="outline" @click="showClaimModal = false">닫기</UiButton>
        </div>
        <div v-else class="flex justify-end gap-2">
          <UiButton variant="outline" :disabled="isClaimProcessing" @click="showClaimModal = false">
            취소
          </UiButton>
          <UiButton
            :variant="['reject', 'refund'].includes(claimAction) ? 'error' : 'primary'"
            :disabled="!canExecuteClaim"
            :loading="isClaimProcessing"
            @click="executeClaimAction"
          >
            {{ claimAvailableActions.find(a => a.value === claimAction)?.label || '확인' }}
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutDetailPage>
</template>
