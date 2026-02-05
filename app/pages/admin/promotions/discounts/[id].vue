<script setup>
/**
 * 할인 등록/수정 페이지
 * - /admin/promotions/discounts/new → 등록 모드
 * - /admin/promotions/discounts/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')

// 할인 종류 옵션
const discountTypeOptions = [
  { value: 'percent', label: '%' },
  { value: 'amount', label: '원' },
]

// 카테고리 옵션
const categoryOptions = [
  { value: 'outer', label: '아우터' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'shoes', label: '신발' },
  { value: 'acc', label: '액세서리' },
]

// 원단위 절사 옵션
const roundingUnitOptions = [
  { value: 10, label: '10원 단위' },
  { value: 100, label: '100원 단위' },
]

// 폼 데이터
const form = ref({
  name: '',
  type: 'percent',
  value: 0,
  useRounding: false,
  roundingUnit: 10,
  targetCategories: [],
  startDate: '',
  endDate: '',
  hasEndDate: true,
  status: 'inactive',
})

// 전체 선택 여부
const isAllCategories = computed(() => form.value.targetCategories.length === 0)

// 전체 토글
const toggleAllCategories = () => {
  form.value.targetCategories = []
}

// 카테고리 토글
const toggleCategory = (value) => {
  const idx = form.value.targetCategories.indexOf(value)
  if (idx > -1) {
    form.value.targetCategories.splice(idx, 1)
  } else {
    form.value.targetCategories.push(value)
  }
}

const isLoading = ref(false)
const isSaving = ref(false)

// 데이터 로드 (수정 모드에서만)
const fetchDiscount = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock 데이터
  form.value = {
    name: '신년 세일',
    type: 'percent',
    value: 20,
    useRounding: true,
    roundingUnit: 100,
    targetCategories: [],
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    hasEndDate: true,
    status: 'active',
  }

  isLoading.value = false
}

// 저장
const handleSave = async () => {
  if (!form.value.name) {
    uiStore.showToast({ type: 'error', message: '할인명을 입력해주세요.' })
    return
  }
  if (form.value.value <= 0) {
    uiStore.showToast({ type: 'error', message: '할인 금액/비율을 입력해주세요.' })
    return
  }
  if (form.value.type === 'percent' && form.value.value > 100) {
    uiStore.showToast({ type: 'error', message: '할인율은 100%를 초과할 수 없습니다.' })
    return
  }
  if (!form.value.startDate) {
    uiStore.showToast({ type: 'error', message: '시작일을 입력해주세요.' })
    return
  }

  isSaving.value = true

  const payload = {
    name: form.value.name,
    type: form.value.type,
    value: form.value.value,
    useRounding: form.value.type === 'percent' ? form.value.useRounding : false,
    roundingUnit: form.value.type === 'percent' && form.value.useRounding ? form.value.roundingUnit : null,
    targetCategories: form.value.targetCategories.length > 0 ? form.value.targetCategories : null,
    startDate: form.value.startDate,
    endDate: form.value.hasEndDate ? form.value.endDate : null,
    status: form.value.status,
  }

  console.log(isEditMode.value ? '수정 데이터:' : '등록 데이터:', payload)
  await new Promise((resolve) => setTimeout(resolve, 500))

  uiStore.showToast({
    type: 'success',
    message: isEditMode.value ? '할인이 수정되었습니다.' : '할인이 등록되었습니다.',
  })
  router.push('/admin/promotions/discounts')
}

// 삭제 (수정 모드에서만)
const handleDelete = async () => {
  if (!confirm('이 할인을 삭제하시겠습니까?')) return
  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
  router.push('/admin/promotions/discounts')
}

const handleCancel = () => router.back()

onMounted(() => {
  if (isEditMode.value) {
    fetchDiscount()
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? '할인 수정' : '할인 등록'"
    :description="isEditMode ? '할인 정보를 수정합니다.' : '새 할인을 등록합니다.'"
    :is-saving="isSaving"
    show-cancel
    :show-delete="isEditMode"
    @save="handleSave"
    @cancel="handleCancel"
    @delete="handleDelete"
  >

    <div v-if="isLoading" class="flex items-center justify-center py-20"><UiSpinner size="lg" /></div>

    <div v-else class="space-y-6">
      <!-- 상태 -->
      <UiCard title="상태">
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.status" type="radio" value="active" class="w-4 h-4 text-primary-600">
            <span class="text-sm text-neutral-700">활성</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.status" type="radio" value="inactive" class="w-4 h-4 text-primary-600">
            <span class="text-sm text-neutral-700">비활성</span>
          </label>
        </div>
      </UiCard>

      <!-- 기본 정보 -->
      <UiCard title="기본 정보">
        <div class="space-y-4">
          <!-- 할인명 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">할인명 <span class="text-error-500">*</span></label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="예: 신년 세일">
          </div>

          <!-- 할인 종류 & 금액 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">할인 종류 <span class="text-error-500">*</span></label>
              <div class="flex gap-2">
                <label
                  v-for="opt in discountTypeOptions"
                  :key="opt.value"
                  :class="[
                    'flex-1 px-4 py-2 border rounded-lg cursor-pointer transition-colors text-center',
                    form.type === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                  ]"
                >
                  <input v-model="form.type" type="radio" :value="opt.value" class="sr-only">
                  {{ opt.label }}
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">할인 {{ form.type === 'percent' ? '비율' : '금액' }} <span class="text-error-500">*</span></label>
              <div class="relative">
                <input
                  v-model.number="form.value"
                  type="number"
                  min="0"
                  :max="form.type === 'percent' ? 100 : undefined"
                  class="w-full px-3 py-2 pr-12 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  {{ form.type === 'percent' ? '%' : '원' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 원단위 절사 (% 선택 시에만 표시) -->
          <div v-if="form.type === 'percent'" class="p-4 bg-neutral-50 rounded-lg space-y-3">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm font-medium text-neutral-700">원단위 절사 사용</span>
              <button
                type="button"
                role="switch"
                :aria-checked="form.useRounding"
                :class="[
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  form.useRounding ? 'bg-primary-600' : 'bg-neutral-200',
                ]"
                @click="form.useRounding = !form.useRounding"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    form.useRounding ? 'translate-x-5' : 'translate-x-0',
                  ]"
                />
              </button>
            </label>
            <div v-if="form.useRounding" class="flex gap-2">
              <label
                v-for="opt in roundingUnitOptions"
                :key="opt.value"
                :class="[
                  'flex-1 px-4 py-2 border rounded-lg cursor-pointer transition-colors text-center text-sm',
                  form.roundingUnit === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
                ]"
              >
                <input v-model="form.roundingUnit" type="radio" :value="opt.value" class="sr-only">
                {{ opt.label }}
              </label>
            </div>
            <p v-if="form.useRounding" class="text-xs text-neutral-400">
              예: 10% 할인 시 12,345원 → {{ form.roundingUnit === 10 ? '11,110원 (10원 단위 절사)' : '11,100원 (100원 단위 절사)' }}
            </p>
          </div>
        </div>
      </UiCard>

      <!-- 적용 카테고리 -->
      <UiCard title="적용 카테고리">
        <div class="flex flex-wrap gap-2">
          <label
            :class="[
              'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
              isAllCategories ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
            ]"
          >
            <input type="checkbox" :checked="isAllCategories" class="sr-only" @change="toggleAllCategories">
            전체
          </label>
          <label
            v-for="cat in categoryOptions"
            :key="cat.value"
            :class="[
              'px-4 py-2 border rounded-lg cursor-pointer transition-colors text-sm',
              form.targetCategories.includes(cat.value) ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium' : 'border-neutral-200 hover:border-neutral-300 text-neutral-600',
            ]"
          >
            <input type="checkbox" :checked="form.targetCategories.includes(cat.value)" class="sr-only" @change="toggleCategory(cat.value)">
            {{ cat.label }}
          </label>
        </div>
        <p class="text-xs text-neutral-400 mt-2">선택하지 않으면 전체 상품에 적용됩니다.</p>
      </UiCard>

      <!-- 할인 기간 -->
      <UiCard title="할인 기간">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-neutral-500 mb-1">시작일 <span class="text-error-500">*</span></label>
              <input v-model="form.startDate" type="date" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
            <div>
              <label class="block text-xs text-neutral-500 mb-1">종료일</label>
              <input
                v-model="form.endDate"
                type="date"
                :disabled="!form.hasEndDate"
                :class="['w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500', !form.hasEndDate ? 'bg-neutral-100 text-neutral-400' : '']"
              >
            </div>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="!form.hasEndDate" class="w-4 h-4 text-primary-600 rounded" @change="form.hasEndDate = !$event.target.checked">
            <span class="text-sm text-neutral-700">종료일 없음 (상시 할인)</span>
          </label>
        </div>
      </UiCard>

      <!-- 안내 -->
      <div class="p-4 bg-neutral-100 rounded-lg">
        <div class="flex gap-3">
          <svg class="w-5 h-5 text-neutral-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-neutral-600">상품 별 할인은 <strong>상품 수정</strong>에서, 카테고리/전체 할인은 여기서 등록하세요. 여기 등록된 할인이 우선 적용됩니다.</p>
        </div>
      </div>
    </div>
  </LayoutFormPage>
</template>
