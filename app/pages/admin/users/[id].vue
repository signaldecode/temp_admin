<script setup>
/**
 * 회원 상세 페이지
 * - 회원 기본 정보
 * - 주문 내역
 * - 포인트/적립금 내역
 * - CS 메모
 */

import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/utils/formatters'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const uiStore = useUiStore()
const authStore = useAuthStore()

const userId = computed(() => route.params.id)

// 로딩 상태
const isLoading = ref(true)
const error = ref(null)
const isSavingMemo = ref(false)

// ── 포인트 관련 상태 ──
const pointData = ref(null)
const pointHistory = ref([])
const isLoadingPoints = ref(false)
const pointPage = ref(1)
const pointPerPage = 20
const pointTotalItems = ref(0)
const pointTotalPages = computed(() => Math.ceil(pointTotalItems.value / pointPerPage))

// 포인트 조정 모달
const showPointModal = ref(false)
const isAdjustingPoint = ref(false)
const pointForm = ref({
  amount: '',
  type: 'add', // 'add' | 'deduct'
  reason: '',
})

// 회원 정보
const user = ref(null)

// 최근 주문 내역 (user 응답에 포함)
const recent_orders = computed(() => user.value?.recent_orders || [])

// 현재 관리자 정보
const currentAdmin = computed(() => ({
  id: String(authStore.user?.id || ''),
  name: authStore.user?.name || '관리자',
}))

// CS 메모 목록 (API 필드명을 컴포넌트 형식으로 변환)
const memos = computed(() => {
  if (!user.value?.cs_memos) return []
  return user.value.cs_memos.map((memo) => ({
    id: memo.id,
    content: memo.content,
    adminId: String(memo.created_by),
    adminName: memo.created_by_name,
    createdAt: memo.created_at,
  }))
})

// 데이터 로드
const fetchUser = async () => {
  isLoading.value = true
  error.value = null

  try {
    const response = await $api.get(`/admin/users/${userId.value}`)
    user.value = response.data
  } catch (err) {
    error.value = err.data?.error?.message || err.data?.message || err.message || '회원 정보를 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUser()
})

// 회원 등급 뱃지
const gradeVariant = {
  VVIP: 'error',
  VIP: 'warning',
  '일반': 'neutral',
}

// 회원 상태 뱃지
const statusMap = {
  ACTIVE: { label: '활성', variant: 'success' },
  INACTIVE: { label: '비활성', variant: 'warning' },
  SUSPENDED: { label: '정지', variant: 'error' },
  WITHDRAWN: { label: '탈퇴', variant: 'neutral' },
}

// 주문 상태 뱃지
const orderStatusMap = {
  PENDING: { label: '결제대기', variant: 'neutral' },
  PAID: { label: '결제완료', variant: 'primary' },
  PREPARING: { label: '상품준비중', variant: 'warning' },
  SHIPPING: { label: '배송중', variant: 'info' },
  DELIVERED: { label: '배송완료', variant: 'success' },
  CANCELLED: { label: '취소', variant: 'error' },
  REFUNDED: { label: '환불', variant: 'error' },
}

// 성별
const genderMap = {
  MALE: '남성',
  FEMALE: '여성',
  OTHER: '기타',
}

// 기본 정보 아이템
const basicInfoItems = computed(() => {
  if (!user.value) return []
  return [
    { key: 'userId', label: '회원 ID', value: user.value.user_id },
    { key: 'name', label: '이름', value: user.value.name },
    { key: 'phone', label: '연락처', value: user.value.phone || '-' },
    { key: 'email', label: '이메일', value: user.value.email || '-' },
    { key: 'gender', label: '성별', value: genderMap[user.value.gender] || '-' },
    { key: 'lastLogin', label: '최근 로그인', value: user.value.last_login_at?.replace('T', ' ').slice(0, 16) || '-' },
  ]
})

// 배송지 정보 아이템
const addressInfoItems = computed(() => {
  if (!user.value?.default_address) return []
  const addr = user.value.default_address
  return [
    { key: 'recipient', label: '수령인', value: `${addr.recipient_name} (${addr.recipient_phone})` },
    { key: 'zipcode', label: '우편번호', value: addr.postal_code || '-' },
    { key: 'address', label: '주소', value: addr.address1 || '-' },
  ]
})

// 메모 추가
const handleAddMemo = async (memoData) => {
  isSavingMemo.value = true

  try {
    const response = await $api.post(`/admin/users/${userId.value}/cs-memos`, {
      content: memoData.content,
    })

    // user.cs_memos에 추가 (최신순으로 맨 앞에)
    if (!user.value.cs_memos) {
      user.value.cs_memos = []
    }
    user.value.cs_memos.unshift(response.data)

    uiStore.showToast({
      type: 'success',
      message: '메모가 등록되었습니다.',
    })
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '메모 등록에 실패했습니다.',
    })
  } finally {
    isSavingMemo.value = false
  }
}

// 메모 수정
const handleEditMemo = async (memoData) => {
  isSavingMemo.value = true

  try {
    const response = await $api.put(`/admin/users/${userId.value}/cs-memos/${memoData.id}`, {
      content: memoData.content,
    })

    // user.cs_memos에서 해당 메모 업데이트
    const index = user.value.cs_memos.findIndex((m) => m.id === memoData.id)
    if (index > -1) {
      user.value.cs_memos[index] = response.data
    }

    uiStore.showToast({
      type: 'success',
      message: '메모가 수정되었습니다.',
    })
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '메모 수정에 실패했습니다.',
    })
  } finally {
    isSavingMemo.value = false
  }
}

// 메모 삭제
const handleDeleteMemo = async (memoId) => {
  try {
    await $api.delete(`/admin/users/${userId.value}/cs-memos/${memoId}`)

    // user.cs_memos에서 해당 메모 제거
    user.value.cs_memos = user.value.cs_memos.filter((m) => m.id !== memoId)

    uiStore.showToast({
      type: 'success',
      message: '메모가 삭제되었습니다.',
    })
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '메모 삭제에 실패했습니다.',
    })
  }
}

// ── 포인트 API ──
const fetchPoints = async (page = 1) => {
  isLoadingPoints.value = true
  try {
    const response = await $api.get(`/admin/users/${userId.value}/points`, {
      page: page - 1,
      size: pointPerPage,
    })

    // response = { success, data: { current, history: [...] | { content, total_elements, ... } } }
    const data = response.data ?? response

    pointData.value = data

    const history = data.history || {}
    if (Array.isArray(history)) {
      // 배열로 오는 경우 (데이터가 적을 때)
      pointHistory.value = history
      pointTotalItems.value = history.length
    } else {
      // Page 객체로 오는 경우
      pointHistory.value = history.content || []
      pointTotalItems.value = history.total_elements ?? history.totalElements ?? 0
    }

    pointPage.value = page
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '포인트 정보를 불러오는데 실패했습니다.',
    })
  } finally {
    isLoadingPoints.value = false
  }
}

const handlePointPageChange = (page) => {
  fetchPoints(page)
}

// 포인트 조정 모달 열기
const openPointModal = () => {
  pointForm.value = { amount: '', type: 'add', reason: '' }
  showPointModal.value = true
}

// 포인트 조정 실행
const handlePointAdjust = async () => {
  const rawAmount = parseInt(pointForm.value.amount)
  if (!rawAmount || rawAmount <= 0) {
    uiStore.showToast({ type: 'error', message: '포인트 금액을 올바르게 입력해주세요.' })
    return
  }
  if (!pointForm.value.reason.trim()) {
    uiStore.showToast({ type: 'error', message: '사유를 입력해주세요.' })
    return
  }

  const amount = pointForm.value.type === 'deduct' ? -rawAmount : rawAmount

  isAdjustingPoint.value = true
  try {
    const response = await $api.post(`/admin/users/${userId.value}/points`, {
      amount,
      reason: pointForm.value.reason.trim(),
    })

    const result = response.data || response
    // user의 current_point 업데이트
    if (user.value) {
      user.value.current_point = result.currentAmount ?? result.current_amount
    }

    showPointModal.value = false
    uiStore.showToast({
      type: 'success',
      message: `포인트가 ${pointForm.value.type === 'add' ? '지급' : '차감'}되었습니다.`,
    })

    // 포인트 내역 새로고침
    await fetchPoints(1)
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '포인트 조정에 실패했습니다.',
    })
  } finally {
    isAdjustingPoint.value = false
  }
}

// 포인트 유형 맵 (transaction_type 기준)
const pointTypeMap = {
  EARN: { label: '적립', variant: 'success' },
  USE: { label: '사용', variant: 'error' },
  ADMIN: { label: '관리자 조정', variant: 'warning' },
  CANCEL: { label: '취소', variant: 'neutral' },
  EXPIRE: { label: '소멸', variant: 'neutral' },
}

// 목록으로 돌아가기
const goBack = () => {
  router.push('/admin/users')
}

// 주문 상세로 이동
const goToOrder = (orderId) => {
  router.push(`/admin/orders/${orderId}`)
}

// 활성 탭
const activeTab = ref('info')
const tabs = [
  { id: 'info', label: '기본 정보' },
  { id: 'orders', label: '주문 내역' },
  { id: 'point', label: '포인트' },
]

// 포인트 탭 진입 시 데이터 로드
watch(activeTab, (tab) => {
  if (tab === 'point' && pointHistory.value.length === 0 && !isLoadingPoints.value) {
    fetchPoints()
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
        회원 목록
      </button>
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-neutral-900">회원 상세</h1>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-20">
      <p class="text-error-600 mb-4">{{ error }}</p>
      <UiButton variant="outline" @click="fetchUser">다시 시도</UiButton>
    </div>

    <!-- Content -->
    <template v-else-if="user">
      <!-- User Summary Card -->
      <UiCard class="mb-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Avatar -->
          <div class="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {{ user.name?.charAt(0) || '?' }}
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-xl font-bold text-neutral-900">{{ user.name }}</h2>
              <UiBadge :variant="gradeVariant[user.grade?.name] || 'neutral'">
                {{ user.grade?.name || '-' }}
              </UiBadge>
              <UiBadge :variant="statusMap[user.status]?.variant || 'neutral'" dot>
                {{ statusMap[user.status]?.label || user.status }}
              </UiBadge>
            </div>
            <p class="text-sm text-neutral-600">{{ user.user_id }} · {{ user.email }}</p>
            <p class="text-sm text-neutral-500">가입일: {{ user.created_at?.split('T')[0] }}</p>
          </div>

          <!-- Stats -->
          <div class="flex gap-6 md:gap-8 text-center">
            <div>
              <p class="text-2xl font-bold text-neutral-900">{{ user.order_statistics?.total_order_count || 0 }}</p>
              <p class="text-sm text-neutral-500">총 주문</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(user.order_statistics?.total_order_amount || 0) }}</p>
              <p class="text-sm text-neutral-500">총 주문금액</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-neutral-900">{{ formatCurrency(user.current_point || 0) }}</p>
              <p class="text-sm text-neutral-500">보유 포인트</p>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- Tabs -->
      <div class="border-b border-neutral-200 mb-6">
        <nav class="flex gap-4 -mb-px">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="[
              'py-3 px-1 text-sm font-medium border-b-2 transition-colors',
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

      <!-- Tab Content: 기본 정보 -->
      <div v-if="activeTab === 'info'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 기본 정보 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">기본 정보</h3>
          </template>
          <UiDescriptionList :items="basicInfoItems" />
        </UiCard>

        <!-- 배송 정보 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">기본 배송지</h3>
          </template>
          <UiDescriptionList v-if="user.default_address" :items="addressInfoItems">
            <template #value-address>
              {{ user.default_address?.address1 || '-' }}
              <span v-if="user.default_address?.address2" class="block text-neutral-500">{{ user.default_address.address2 }}</span>
            </template>
          </UiDescriptionList>
          <p v-else class="text-sm text-neutral-500">등록된 배송지가 없습니다.</p>
        </UiCard>

        <!-- 주문 통계 -->
        <UiCard class="lg:col-span-2">
          <template #header>
            <h3 class="font-semibold text-neutral-900">주문 통계</h3>
          </template>
          <dl class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center p-4 bg-neutral-50 rounded-lg">
              <dd class="text-2xl font-bold text-neutral-900">{{ user.order_statistics?.total_order_count || 0 }}건</dd>
              <dt class="text-sm text-neutral-500 mt-1">총 주문수</dt>
            </div>
            <div class="text-center p-4 bg-neutral-50 rounded-lg">
              <dd class="text-2xl font-bold text-primary-600">{{ formatCurrency(user.order_statistics?.total_order_amount || 0) }}</dd>
              <dt class="text-sm text-neutral-500 mt-1">총 주문금액</dt>
            </div>
            <div class="text-center p-4 bg-neutral-50 rounded-lg">
              <dd class="text-2xl font-bold text-neutral-900">{{ formatCurrency(user.order_statistics?.average_order_amount || 0) }}</dd>
              <dt class="text-sm text-neutral-500 mt-1">평균 주문금액</dt>
            </div>
            <div class="text-center p-4 bg-neutral-50 rounded-lg">
              <dd class="text-2xl font-bold text-neutral-900">{{ user.order_statistics?.cancelled_count || 0 }}건</dd>
              <dt class="text-sm text-neutral-500 mt-1">취소</dt>
            </div>
            <div class="text-center p-4 bg-neutral-50 rounded-lg">
              <dd class="text-2xl font-bold text-neutral-900">{{ user.order_statistics?.refunded_count || 0 }}건</dd>
              <dt class="text-sm text-neutral-500 mt-1">환불</dt>
            </div>
          </dl>
        </UiCard>

        <!-- CS 메모 -->
        <UiCard class="lg:col-span-2">
          <template #header>
            <h3 class="font-semibold text-neutral-900">CS 메모</h3>
          </template>
          <DomainMemoHistory
            :memos="memos"
            :is-saving="isSavingMemo"
            :current-admin-id="currentAdmin.id"
            :current-admin-name="currentAdmin.name"
            placeholder="회원에 대한 메모를 남겨주세요..."
            @add="handleAddMemo"
            @edit="handleEditMemo"
            @delete="handleDeleteMemo"
          />
        </UiCard>
      </div>

      <!-- Tab Content: 주문 내역 -->
      <div v-if="activeTab === 'orders'">
        <UiCard padding="none">
          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50">
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">주문번호</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">주문일</th>
                  <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">상품</th>
                  <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600">금액</th>
                  <th class="text-center py-3 px-4 text-sm font-medium text-neutral-600">상태</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in recent_orders"
                  :key="order.order_id"
                  class="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                  @click="goToOrder(order.order_id)"
                >
                  <td class="py-3 px-4 text-sm font-medium text-primary-600">{{ order.order_number }}</td>
                  <td class="py-3 px-4 text-sm text-neutral-600">{{ order.ordered_at?.split('T')[0] }}</td>
                  <td class="py-3 px-4 text-sm text-neutral-900">{{ order.product_summary }}</td>
                  <td class="py-3 px-4 text-sm text-neutral-900 text-right font-medium">{{ formatCurrency(order.total_amount) }}</td>
                  <td class="py-3 px-4 text-center">
                    <UiBadge :variant="orderStatusMap[order.status]?.variant || 'neutral'" size="sm">
                      {{ orderStatusMap[order.status]?.label || order.status }}
                    </UiBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden divide-y divide-neutral-100">
            <div
              v-for="order in recent_orders"
              :key="order.order_id"
              class="p-4 hover:bg-neutral-50 cursor-pointer"
              @click="goToOrder(order.order_id)"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-primary-600">{{ order.order_number }}</span>
                <UiBadge :variant="orderStatusMap[order.status]?.variant || 'neutral'" size="sm">
                  {{ orderStatusMap[order.status]?.label || order.status }}
                </UiBadge>
              </div>
              <p class="text-sm text-neutral-900">{{ order.product_summary }}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-neutral-500">{{ order.ordered_at?.split('T')[0] }}</span>
                <span class="text-sm font-medium text-neutral-900">{{ formatCurrency(order.total_amount) }}</span>
              </div>
            </div>
          </div>

          <UiEmpty
            v-if="recent_orders.length === 0"
            title="주문 내역이 없습니다"
          />
        </UiCard>
      </div>

      <!-- Tab Content: 포인트 -->
      <div v-if="activeTab === 'point'" class="space-y-6">
        <!-- 보유 포인트 + 조정 버튼 -->
        <UiCard>
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-center sm:text-left">
              <p class="text-sm text-neutral-500 mb-1">현재 보유 포인트</p>
              <p class="text-3xl font-bold text-primary-600">{{ formatCurrency(user.current_point || 0) }}</p>
            </div>
            <UiButton variant="primary" @click="openPointModal">
              포인트 조정
            </UiButton>
          </div>
        </UiCard>

        <!-- 포인트 내역 -->
        <UiCard padding="none">
          <template #header>
            <h3 class="font-semibold text-neutral-900">포인트 내역</h3>
          </template>

          <!-- Loading -->
          <div v-if="isLoadingPoints" class="flex items-center justify-center py-12">
            <UiSpinner size="md" />
          </div>

          <template v-else>
            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-neutral-200 bg-neutral-50">
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">일시</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">유형</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-neutral-600">사유</th>
                    <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600">변동</th>
                    <th class="text-right py-3 px-4 text-sm font-medium text-neutral-600">잔액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in pointHistory"
                    :key="item.id"
                    class="border-b border-neutral-100"
                  >
                    <td class="py-3 px-4 text-sm text-neutral-600">{{ item.created_at?.replace('T', ' ').slice(0, 16) }}</td>
                    <td class="py-3 px-4">
                      <UiBadge :variant="pointTypeMap[item.transaction_type]?.variant || 'neutral'" size="sm">
                        {{ pointTypeMap[item.transaction_type]?.label || item.transaction_type }}
                      </UiBadge>
                    </td>
                    <td class="py-3 px-4 text-sm text-neutral-900">{{ item.reason || '-' }}</td>
                    <td class="py-3 px-4 text-sm text-right font-medium" :class="item.amount > 0 ? 'text-success-600' : 'text-error-600'">
                      {{ item.amount > 0 ? '+' : '' }}{{ formatCurrency(item.amount) }}
                    </td>
                    <td class="py-3 px-4 text-sm text-right text-neutral-700">{{ formatCurrency(item.balance_after) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards -->
            <div class="md:hidden divide-y divide-neutral-100">
              <div
                v-for="item in pointHistory"
                :key="item.id"
                class="p-4"
              >
                <div class="flex items-center justify-between mb-1">
                  <UiBadge :variant="pointTypeMap[item.transaction_type]?.variant || 'neutral'" size="sm">
                    {{ pointTypeMap[item.transaction_type]?.label || item.transaction_type }}
                  </UiBadge>
                  <span class="text-sm font-medium" :class="item.amount > 0 ? 'text-success-600' : 'text-error-600'">
                    {{ item.amount > 0 ? '+' : '' }}{{ formatCurrency(item.amount) }}
                  </span>
                </div>
                <p class="text-sm text-neutral-900">{{ item.reason || '-' }}</p>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs text-neutral-500">{{ item.created_at?.replace('T', ' ').slice(0, 16) }}</span>
                  <span class="text-xs text-neutral-500">잔액 {{ formatCurrency(item.balance_after) }}</span>
                </div>
              </div>
            </div>

            <UiEmpty
              v-if="pointHistory.length === 0"
              title="포인트 내역이 없습니다"
            />

            <!-- Pagination -->
            <div v-if="pointTotalPages > 1" class="p-4 border-t border-neutral-200">
              <UiPagination
                v-model:current-page="pointPage"
                :total-pages="pointTotalPages"
                :total-items="pointTotalItems"
                :per-page="pointPerPage"
                @change="handlePointPageChange"
              />
            </div>
          </template>
        </UiCard>
      </div>

      <!-- 포인트 조정 모달 -->
      <UiModal
        v-model="showPointModal"
        title="포인트 수동 조정"
        size="sm"
      >
        <div class="space-y-4">
          <!-- 현재 포인트 -->
          <div class="p-3 bg-neutral-50 rounded-lg text-center">
            <p class="text-sm text-neutral-500">현재 보유</p>
            <p class="text-xl font-bold text-neutral-900">{{ formatCurrency(user?.current_point || 0) }}</p>
          </div>

          <!-- 지급/차감 선택 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">유형</label>
            <div class="flex gap-2">
              <button
                type="button"
                :class="[
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors',
                  pointForm.type === 'add'
                    ? 'border-success-500 bg-success-50 text-success-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
                ]"
                @click="pointForm.type = 'add'"
              >
                지급 (+)
              </button>
              <button
                type="button"
                :class="[
                  'flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors',
                  pointForm.type === 'deduct'
                    ? 'border-error-500 bg-error-50 text-error-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
                ]"
                @click="pointForm.type = 'deduct'"
              >
                차감 (-)
              </button>
            </div>
          </div>

          <!-- 금액 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">포인트</label>
            <input
              v-model="pointForm.amount"
              type="number"
              min="1"
              placeholder="조정할 포인트 금액"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
          </div>

          <!-- 사유 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">사유 <span class="text-error-500">*</span></label>
            <textarea
              v-model="pointForm.reason"
              rows="3"
              placeholder="포인트 조정 사유를 입력하세요"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UiButton variant="outline" :disabled="isAdjustingPoint" @click="showPointModal = false">
              취소
            </UiButton>
            <UiButton
              :variant="pointForm.type === 'deduct' ? 'danger' : 'primary'"
              :loading="isAdjustingPoint"
              @click="handlePointAdjust"
            >
              {{ pointForm.type === 'add' ? '지급' : '차감' }}
            </UiButton>
          </div>
        </template>
      </UiModal>
    </template>

    <!-- Not Found -->
    <UiCard v-else>
      <UiEmpty
        title="회원을 찾을 수 없습니다"
        description="존재하지 않거나 삭제된 회원입니다."
      >
        <template #action>
          <UiButton variant="primary" @click="goBack">
            목록으로 돌아가기
          </UiButton>
        </template>
      </UiEmpty>
    </UiCard>
  </LayoutDetailPage>
</template>
