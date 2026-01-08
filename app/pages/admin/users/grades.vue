<script setup>
/**
 * 회원 등급 관리 페이지
 * - 등급 목록 및 설정
 * - 등급별 조건/혜택 관리
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 혜택 옵션 목록 (실제 기능과 연결될 ID 기반)
const benefitOptions = [
  { id: 'free_shipping', label: '무료 배송', description: '전 상품 무료 배송' },
  { id: 'vip_coupon', label: 'VIP 전용 쿠폰', description: '매월 VIP 전용 할인 쿠폰 지급' },
  { id: 'birthday_benefit', label: '생일 특별 혜택', description: '생일 달 추가 할인 및 쿠폰' },
  { id: 'priority_cs', label: '전용 고객센터', description: '우선 상담 및 전담 매니저' },
  { id: 'early_access', label: '신상품 선공개', description: '신상품 출시 전 우선 구매' },
  { id: 'free_return', label: '무료 반품', description: '30일 내 무료 반품' },
  { id: 'double_point', label: '포인트 2배 적립', description: '특정 기간 포인트 2배' },
  { id: 'exclusive_sale', label: '전용 세일 참여', description: '등급 전용 특별 세일' },
]

// 혜택 ID로 라벨 가져오기
const getBenefitLabel = (id) => {
  return benefitOptions.find((b) => b.id === id)?.label || id
}

// 등급 목록
const grades = ref([
  {
    id: 1,
    name: 'VVIP',
    color: 'error',
    minAmount: 5000000,
    discountRate: 10,
    pointRate: 5,
    benefits: ['free_shipping', 'vip_coupon', 'birthday_benefit', 'priority_cs', 'early_access', 'free_return'],
    memberCount: 12,
  },
  {
    id: 2,
    name: 'VIP',
    color: 'warning',
    minAmount: 1000000,
    discountRate: 5,
    pointRate: 3,
    benefits: ['free_shipping', 'vip_coupon', 'birthday_benefit'],
    memberCount: 45,
  },
  {
    id: 3,
    name: '일반',
    color: 'neutral',
    minAmount: 0,
    discountRate: 0,
    pointRate: 1,
    benefits: [],
    memberCount: 238,
  },
])

// 등급 색상 매핑
const colorVariant = {
  error: 'error',
  warning: 'warning',
  neutral: 'neutral',
}

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 등급 편집 모달
const showEditModal = ref(false)
const editingGrade = ref(null)
const editForm = ref({
  name: '',
  minAmount: 0,
  discountRate: 0,
  pointRate: 0,
  benefits: [],
})

// 등급 편집 열기
const openEditModal = (grade) => {
  editingGrade.value = grade
  editForm.value = {
    name: grade.name,
    minAmount: grade.minAmount,
    discountRate: grade.discountRate,
    pointRate: grade.pointRate,
    benefits: [...grade.benefits],
  }
  showEditModal.value = true
}

// 혜택 토글
const toggleBenefit = (benefitId) => {
  const index = editForm.value.benefits.indexOf(benefitId)
  if (index > -1) {
    editForm.value.benefits.splice(index, 1)
  } else {
    editForm.value.benefits.push(benefitId)
  }
}

// 혜택 선택 여부
const isBenefitSelected = (benefitId) => {
  return editForm.value.benefits.includes(benefitId)
}

// 등급 저장
const saveGrade = () => {
  if (!editingGrade.value) return

  const index = grades.value.findIndex((g) => g.id === editingGrade.value.id)
  if (index > -1) {
    grades.value[index] = {
      ...grades.value[index],
      name: editForm.value.name,
      minAmount: Number(editForm.value.minAmount),
      discountRate: Number(editForm.value.discountRate),
      pointRate: Number(editForm.value.pointRate),
      benefits: [...editForm.value.benefits],
    }
  }

  showEditModal.value = false
  editingGrade.value = null

  uiStore.showToast({
    type: 'success',
    message: '등급 설정이 저장되었습니다.',
  })
}

// 등급별 회원 보기
const router = useRouter()
const viewMembers = (gradeName) => {
  // 회원 목록 페이지로 이동하며 등급 필터 적용 (향후 구현)
  router.push(`/admin/users?grade=${gradeName}`)
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-neutral-900">회원 등급</h1>
      <p class="mt-1 text-neutral-600">
        회원 등급별 조건과 혜택을 관리합니다.
      </p>
    </div>

    <!-- Grade Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UiCard
        v-for="grade in grades"
        :key="grade.id"
        padding="none"
      >
        <!-- Header -->
        <div
          :class="[
            'p-4 border-b',
            grade.color === 'error' ? 'bg-error-50 border-error-100' : '',
            grade.color === 'warning' ? 'bg-warning-50 border-warning-100' : '',
            grade.color === 'neutral' ? 'bg-neutral-50 border-neutral-100' : '',
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UiBadge :variant="colorVariant[grade.color]" size="sm">
                {{ grade.name }}
              </UiBadge>
              <span class="text-sm text-neutral-500">{{ grade.memberCount }}명</span>
            </div>
            <button
              type="button"
              class="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-white/50"
              @click="openEditModal(grade)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4">
          <!-- 승급 조건 -->
          <div>
            <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">승급 조건</h4>
            <p class="text-sm text-neutral-900">
              <span v-if="grade.minAmount > 0">
                누적 구매금액 <span class="font-semibold">{{ formatCurrency(grade.minAmount) }}</span> 이상
              </span>
              <span v-else class="text-neutral-500">기본 등급</span>
            </p>
          </div>

          <!-- 혜택 -->
          <div>
            <h4 class="text-xs font-medium text-neutral-500 uppercase mb-2">혜택</h4>
            <div class="space-y-1">
              <p class="text-sm text-neutral-900">
                할인율 <span class="font-semibold">{{ grade.discountRate }}%</span>
              </p>
              <p class="text-sm text-neutral-900">
                적립률 <span class="font-semibold">{{ grade.pointRate }}%</span>
              </p>
              <div v-if="grade.benefits.length > 0" class="mt-2">
                <ul class="text-sm text-neutral-600 space-y-1">
                  <li
                    v-for="benefitId in grade.benefits"
                    :key="benefitId"
                    class="flex items-center gap-1"
                  >
                    <svg class="w-3 h-3 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ getBenefitLabel(benefitId) }}
                  </li>
                </ul>
              </div>
              <p v-else class="text-sm text-neutral-400 mt-2">추가 혜택 없음</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-3 border-t border-neutral-100 bg-neutral-50">
          <button
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            @click="viewMembers(grade.name)"
          >
            회원 보기 →
          </button>
        </div>
      </UiCard>
    </div>

    <!-- Info -->
    <div class="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-info-700">등급 변경 안내</p>
          <p class="text-sm text-info-600 mt-1">
            회원 등급은 <strong>회원 목록</strong>에서 회원을 선택하여 일괄 변경할 수 있습니다.
            등급 자동 승급/강등은 매월 1일에 누적 구매금액을 기준으로 적용됩니다.
          </p>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <UiModal
      v-model="showEditModal"
      :title="`${editingGrade?.name || ''} 등급 설정`"
      size="md"
    >
      <div class="space-y-4">
        <!-- 등급명 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            등급명
          </label>
          <input
            v-model="editForm.name"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
        </div>

        <!-- 승급 조건 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            승급 조건 (누적 구매금액)
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="editForm.minAmount"
              type="number"
              class="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
            <span class="text-sm text-neutral-500">원 이상</span>
          </div>
        </div>

        <!-- 할인율 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            할인율
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="editForm.discountRate"
              type="number"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
            <span class="text-sm text-neutral-500">%</span>
          </div>
        </div>

        <!-- 적립률 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">
            포인트 적립률
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="editForm.pointRate"
              type="number"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
            <span class="text-sm text-neutral-500">%</span>
          </div>
        </div>

        <!-- 추가 혜택 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">
            추가 혜택
          </label>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <label
              v-for="benefit in benefitOptions"
              :key="benefit.id"
              class="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
              :class="{ 'border-primary-300 bg-primary-50': isBenefitSelected(benefit.id) }"
            >
              <input
                type="checkbox"
                :checked="isBenefitSelected(benefit.id)"
                class="mt-0.5 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                @change="toggleBenefit(benefit.id)"
              >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-neutral-900">{{ benefit.label }}</p>
                <p class="text-xs text-neutral-500 mt-0.5">{{ benefit.description }}</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton
            variant="outline"
            @click="showEditModal = false"
          >
            취소
          </UiButton>
          <UiButton
            variant="primary"
            @click="saveGrade"
          >
            저장
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
