<script setup>
/**
 * Admin Dashboard
 * 관리자 대시보드 메인 페이지
 */
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

const authStore = useAuthStore()
const tenantStore = useTenantStore()

// 주문 현황 데이터
const orderStats = ref([
  {
    id: 'new',
    label: '신규주문',
    value: 12,
    color: 'primary',
    to: '/admin/orders?status=new',
  },
  {
    id: 'ready',
    label: '배송준비',
    value: 28,
    color: 'warning',
    to: '/admin/orders?status=ready',
  },
  {
    id: 'shipping',
    label: '배송중',
    value: 45,
    color: 'info',
    to: '/admin/orders?status=shipping',
  },
  {
    id: 'delivered',
    label: '배송완료',
    value: 156,
    color: 'success',
    to: '/admin/orders?status=delivered',
  },
])

// 매출 현황 데이터
const salesStats = ref([
  {
    id: 'today',
    label: '오늘 매출',
    value: 3240000,
    change: '+12%',
    changeType: 'positive',
  },
  {
    id: 'week',
    label: '일주일 매출',
    value: 18750000,
    change: '+8%',
    changeType: 'positive',
  },
  {
    id: 'month',
    label: '이번달 매출',
    value: 67320000,
    change: '-3%',
    changeType: 'negative',
  },
])

// 교환/반품/취소 현황
const claimStats = ref([
  {
    id: 'cancel',
    label: '취소요청',
    value: 5,
    color: 'error',
    to: '/admin/orders/claims?type=cancel',
  },
  {
    id: 'return',
    label: '반품요청',
    value: 3,
    color: 'warning',
    to: '/admin/orders/claims?type=return',
  },
  {
    id: 'exchange',
    label: '교환요청',
    value: 2,
    color: 'info',
    to: '/admin/orders/claims?type=exchange',
  },
])

// 최근 주문 (미리보기)
const recentOrders = ref([
  { id: '1001', customer: '김철수', amount: 89000, status: 'new', date: '2025-01-06 14:30' },
  { id: '1002', customer: '이영희', amount: 145000, status: 'ready', date: '2025-01-06 14:15' },
  { id: '1003', customer: '박민수', amount: 52000, status: 'shipping', date: '2025-01-06 13:45' },
  { id: '1004', customer: '정수진', amount: 210000, status: 'delivered', date: '2025-01-06 12:30' },
  { id: '1005', customer: '최동욱', amount: 78000, status: 'new', date: '2025-01-06 11:20' },
])

// 주문 상태 뱃지 매핑
const statusMap = {
  new: { label: '신규', variant: 'primary' },
  ready: { label: '배송준비', variant: 'warning' },
  shipping: { label: '배송중', variant: 'info' },
  delivered: { label: '배송완료', variant: 'success' },
  cancelled: { label: '취소', variant: 'error' },
}

// 색상 클래스 매핑
const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    border: 'border-primary-200',
  },
  success: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  warning: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  error: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    border: 'border-error-200',
  },
  info: {
    bg: 'bg-info-50',
    text: 'text-info-700',
    border: 'border-info-200',
  },
}

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value)
}

// 주문번호 검색
const router = useRouter()
const searchOrderNo = ref('')

const handleOrderSearch = () => {
  const keyword = searchOrderNo.value.trim()
  if (!keyword) return

  router.push({
    path: '/admin/orders',
    query: { keyword, type: 'orderNo' },
  })
}
</script>

<template>
  <LayoutDetailPage>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900">대시보드</h1>
          <p class="mt-1 text-neutral-600">
            안녕하세요, {{ authStore.userName || '관리자' }}님.
          </p>
        </div>
        <!-- 주문번호 검색 -->
        <div class="flex gap-2">
          <input
            v-model="searchOrderNo"
            type="text"
            placeholder="주문번호로 검색"
            class="w-48 md:w-56 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @keyup.enter="handleOrderSearch"
          >
          <UiButton variant="primary" size="sm" @click="handleOrderSearch">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </UiButton>
        </div>
      </div>
    </div>

    <!-- 주문 현황 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-neutral-900">주문 현황</h2>
        <NuxtLink
          to="/admin/orders"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          주문목록 →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <NuxtLink
          v-for="stat in orderStats"
          :key="stat.id"
          :to="stat.to"
          :class="[
            'block p-4 rounded-lg border transition-all hover:shadow-md',
            colorClasses[stat.color].bg,
            colorClasses[stat.color].border,
          ]"
        >
          <p :class="['text-sm', colorClasses[stat.color].text]">{{ stat.label }}</p>
          <p :class="['text-3xl font-bold mt-1', colorClasses[stat.color].text]">
            {{ stat.value }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- 매출 현황 -->
    <section class="mb-6">
      <h2 class="text-lg font-semibold text-neutral-900 mb-3">매출 현황</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <UiCard
          v-for="stat in salesStats"
          :key="stat.id"
          padding="md"
        >
          <p class="text-sm text-neutral-500">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-neutral-900 mt-1">
            {{ formatCurrency(stat.value) }}
          </p>
          <p
            :class="[
              'text-sm font-medium mt-1',
              stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600',
            ]"
          >
            {{ stat.change }} vs 이전 기간
          </p>
        </UiCard>
      </div>
    </section>

    <!-- 교환/반품/취소 현황 -->
    <section class="mb-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-neutral-900">교환/반품/취소 관리</h2>
        <NuxtLink
          to="/admin/orders/claims"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          전체 보기 →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <NuxtLink
          v-for="stat in claimStats"
          :key="stat.id"
          :to="stat.to"
          :class="[
            'block p-4 rounded-lg border transition-all hover:shadow-md text-center',
            colorClasses[stat.color].bg,
            colorClasses[stat.color].border,
          ]"
        >
          <p :class="['text-sm', colorClasses[stat.color].text]">{{ stat.label }}</p>
          <p :class="['text-3xl font-bold mt-1', colorClasses[stat.color].text]">
            {{ stat.value }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- 최근 주문 -->
    <section>
      <UiCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-neutral-900">최근 주문</h2>
            <NuxtLink
              to="/admin/orders"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              주문목록 →
            </NuxtLink>
          </div>
        </template>

        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto -mx-4 md:-mx-6">
          <table class="w-full">
            <thead>
              <tr class="border-b border-neutral-200">
                <th class="text-left py-3 px-4 md:px-6 text-sm font-medium text-neutral-500">주문번호</th>
                <th class="text-left py-3 px-4 text-sm font-medium text-neutral-500">고객명</th>
                <th class="text-right py-3 px-4 text-sm font-medium text-neutral-500">금액</th>
                <th class="text-center py-3 px-4 text-sm font-medium text-neutral-500">상태</th>
                <th class="text-left py-3 px-4 md:px-6 text-sm font-medium text-neutral-500">일시</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in recentOrders"
                :key="order.id"
                class="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer"
                @click="$router.push(`/admin/orders/${order.id}`)"
              >
                <td class="py-3 px-4 md:px-6 text-sm font-medium text-primary-600">#{{ order.id }}</td>
                <td class="py-3 px-4 text-sm text-neutral-700">{{ order.customer }}</td>
                <td class="py-3 px-4 text-sm text-neutral-900 text-right font-medium">
                  {{ formatCurrency(order.amount) }}
                </td>
                <td class="py-3 px-4 text-center">
                  <UiBadge
                    :variant="statusMap[order.status].variant"
                    size="sm"
                  >
                    {{ statusMap[order.status].label }}
                  </UiBadge>
                </td>
                <td class="py-3 px-4 md:px-6 text-sm text-neutral-500">{{ order.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-3 -mx-4">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="px-4 py-3 border-b border-neutral-100 last:border-0"
            @click="$router.push(`/admin/orders/${order.id}`)"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-primary-600">#{{ order.id }}</span>
              <UiBadge
                :variant="statusMap[order.status].variant"
                size="sm"
              >
                {{ statusMap[order.status].label }}
              </UiBadge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-neutral-600">{{ order.customer }}</span>
              <span class="text-sm font-medium text-neutral-900">{{ formatCurrency(order.amount) }}</span>
            </div>
            <p class="text-xs text-neutral-500 mt-1">{{ order.date }}</p>
          </div>
        </div>

        <template #footer>
          <div class="text-center">
            <NuxtLink
              to="/admin/orders"
              class="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              주문 목록 전체 보기
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </template>
      </UiCard>
    </section>
  </LayoutDetailPage>
</template>
