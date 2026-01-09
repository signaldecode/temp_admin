<script setup>
/**
 * 회원 상세 페이지
 * - 회원 기본 정보
 * - 주문 내역
 * - 포인트/적립금 내역
 * - 메모
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const userId = computed(() => route.params.id)

// 로딩 상태
const isLoading = ref(true)
const isSavingMemo = ref(false)

// 회원 정보 (Mock 데이터)
const user = ref(null)

// 주문 내역 (Mock 데이터)
const orders = ref([])

// 메모 히스토리
const memos = ref([])

// Mock 데이터 로드
onMounted(() => {
  // 실제로는 API 호출
  setTimeout(() => {
    user.value = {
      id: userId.value,
      userId: 'user001',
      name: '김철수',
      phone: '010-1234-5678',
      email: 'kim@example.com',
      grade: 'VIP',
      status: 'active',
      point: 15000,
      createdAt: '2024-01-15',
      lastLoginAt: '2025-01-06 14:30',
      birthDate: '1990-05-20',
      gender: 'male',
      address: {
        zipcode: '06234',
        address1: '서울시 강남구 테헤란로 123',
        address2: '456호',
      },
      stats: {
        orderCount: 45,
        totalSpent: 1250000,
        avgOrderAmount: 27778,
        cancelCount: 2,
        returnCount: 1,
      },
    }

    orders.value = [
      { id: '1001', date: '2025-01-05', products: '겨울 패딩 자켓 외 2건', amount: 189000, status: 'delivered' },
      { id: '998', date: '2025-01-02', products: '니트 스웨터', amount: 59000, status: 'delivered' },
      { id: '987', date: '2024-12-28', products: '청바지 외 1건', amount: 98000, status: 'delivered' },
      { id: '965', date: '2024-12-20', products: '겨울 부츠', amount: 129000, status: 'delivered' },
      { id: '943', date: '2024-12-15', products: '목도리 세트', amount: 45000, status: 'cancelled' },
    ]

    // 메모 히스토리 (Mock 데이터)
    memos.value = [
      {
        id: 1,
        content: 'VIP 고객, 응대 시 주의 필요',
        adminId: 'admin001',
        adminName: '김관리',
        createdAt: '2025-01-06 10:30:00',
      },
      {
        id: 2,
        content: '환불 요청 시 즉시 처리 요망 (이전 CS 건 참고)',
        adminId: 'admin002',
        adminName: '이담당',
        createdAt: '2025-01-05 14:20:00',
      },
      {
        id: 3,
        content: '생일 기념 쿠폰 발급 완료 (5/20)',
        adminId: 'admin001',
        adminName: '김관리',
        createdAt: '2024-05-18 09:00:00',
      },
    ]

    isLoading.value = false
  }, 500)
})

// 회원 등급 뱃지
const gradeVariant = {
  VVIP: 'error',
  VIP: 'warning',
  '일반': 'neutral',
}

// 회원 상태 뱃지
const statusMap = {
  active: { label: '활성', variant: 'success' },
  dormant: { label: '휴면', variant: 'warning' },
  withdrawn: { label: '탈퇴', variant: 'neutral' },
}

// 주문 상태 뱃지
const orderStatusMap = {
  new: { label: '신규', variant: 'primary' },
  ready: { label: '배송준비', variant: 'warning' },
  shipping: { label: '배송중', variant: 'info' },
  delivered: { label: '배송완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'error' },
}

// 성별
const genderMap = {
  male: '남성',
  female: '여성',
  other: '기타',
}

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 기본 정보 아이템
const basicInfoItems = computed(() => {
  if (!user.value) return []
  return [
    { key: 'userId', label: '회원 ID', value: user.value.userId },
    { key: 'name', label: '이름', value: user.value.name },
    { key: 'phone', label: '연락처', value: user.value.phone },
    { key: 'email', label: '이메일', value: user.value.email },
    { key: 'birthDate', label: '생년월일', value: user.value.birthDate || '-' },
    { key: 'gender', label: '성별', value: genderMap[user.value.gender] || '-' },
  ]
})

// 배송지 정보 아이템
const addressInfoItems = computed(() => {
  if (!user.value) return []
  return [
    { key: 'zipcode', label: '우편번호', value: user.value.address?.zipcode || '-' },
    { key: 'address', label: '주소', value: user.value.address?.address1 || '-' },
  ]
})

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
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-20"
    >
      <UiSpinner size="lg" />
    </div>

    <!-- Content -->
    <template v-else-if="user">
      <!-- User Summary Card -->
      <UiCard class="mb-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Avatar -->
          <div class="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {{ user.name.charAt(0) }}
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-xl font-bold text-neutral-900">{{ user.name }}</h2>
              <UiBadge :variant="gradeVariant[user.grade] || 'neutral'">
                {{ user.grade }}
              </UiBadge>
              <UiBadge :variant="statusMap[user.status].variant" dot>
                {{ statusMap[user.status].label }}
              </UiBadge>
            </div>
            <p class="text-sm text-neutral-600">{{ user.userId }} · {{ user.email }}</p>
            <p class="text-sm text-neutral-500">가입일: {{ user.createdAt }} · 최근 로그인: {{ user.lastLoginAt }}</p>
          </div>

          <!-- Stats -->
          <div class="flex gap-6 md:gap-8 text-center">
            <div>
              <p class="text-2xl font-bold text-neutral-900">{{ user.stats.orderCount }}</p>
              <p class="text-sm text-neutral-500">총 주문</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-primary-600">{{ formatCurrency(user.stats.totalSpent) }}</p>
              <p class="text-sm text-neutral-500">총 주문금액</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-neutral-900">{{ formatCurrency(user.point) }}</p>
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
          <UiDescriptionList :items="addressInfoItems">
            <template #value-address>
              {{ user.address?.address1 || '-' }}
              <span v-if="user.address?.address2" class="block">{{ user.address.address2 }}</span>
            </template>
          </UiDescriptionList>
        </UiCard>

        <!-- 주문 통계 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">주문 통계</h3>
          </template>
          <dl class="space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-neutral-500">총 주문수</dt>
              <dd class="text-sm font-medium text-neutral-900">{{ user.stats.orderCount }}건</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-neutral-500">총 주문금액</dt>
              <dd class="text-sm font-medium text-neutral-900">{{ formatCurrency(user.stats.totalSpent) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-neutral-500">평균 주문금액</dt>
              <dd class="text-sm font-medium text-neutral-900">{{ formatCurrency(user.stats.avgOrderAmount) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-neutral-500">취소</dt>
              <dd class="text-sm font-medium text-neutral-900">{{ user.stats.cancelCount }}건</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-neutral-500">반품/교환</dt>
              <dd class="text-sm font-medium text-neutral-900">{{ user.stats.returnCount }}건</dd>
            </div>
          </dl>
        </UiCard>

        <!-- 관리자 메모 히스토리 -->
        <UiCard class="lg:col-span-2">
          <template #header>
            <h3 class="font-semibold text-neutral-900">관리자 메모</h3>
          </template>
          <DomainMemoHistory
            :memos="memos"
            :is-saving="isSavingMemo"
            current-admin-id="admin001"
            current-admin-name="김관리"
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
                  v-for="order in orders"
                  :key="order.id"
                  class="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                  @click="goToOrder(order.id)"
                >
                  <td class="py-3 px-4 text-sm font-medium text-primary-600">#{{ order.id }}</td>
                  <td class="py-3 px-4 text-sm text-neutral-600">{{ order.date }}</td>
                  <td class="py-3 px-4 text-sm text-neutral-900">{{ order.products }}</td>
                  <td class="py-3 px-4 text-sm text-neutral-900 text-right font-medium">{{ formatCurrency(order.amount) }}</td>
                  <td class="py-3 px-4 text-center">
                    <UiBadge :variant="orderStatusMap[order.status].variant" size="sm">
                      {{ orderStatusMap[order.status].label }}
                    </UiBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden divide-y divide-neutral-100">
            <div
              v-for="order in orders"
              :key="order.id"
              class="p-4 hover:bg-neutral-50 cursor-pointer"
              @click="goToOrder(order.id)"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-primary-600">#{{ order.id }}</span>
                <UiBadge :variant="orderStatusMap[order.status].variant" size="sm">
                  {{ orderStatusMap[order.status].label }}
                </UiBadge>
              </div>
              <p class="text-sm text-neutral-900">{{ order.products }}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-neutral-500">{{ order.date }}</span>
                <span class="text-sm font-medium text-neutral-900">{{ formatCurrency(order.amount) }}</span>
              </div>
            </div>
          </div>

          <UiEmpty
            v-if="orders.length === 0"
            title="주문 내역이 없습니다"
          />
        </UiCard>
      </div>

      <!-- Tab Content: 포인트 -->
      <div v-if="activeTab === 'point'">
        <UiCard>
          <div class="text-center py-8">
            <p class="text-3xl font-bold text-primary-600 mb-2">{{ formatCurrency(user.point) }}</p>
            <p class="text-neutral-600">현재 보유 포인트</p>
          </div>
          <div class="border-t border-neutral-200 pt-4">
            <p class="text-sm text-neutral-500 text-center">포인트 적립/사용 내역은 추후 구현 예정</p>
          </div>
        </UiCard>
      </div>
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
