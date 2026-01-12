<script setup>
/**
 * 상품 등록/수정 페이지
 * - /admin/products/new → 등록 모드
 * - /admin/products/:id → 수정 모드
 */

import { useUiStore } from '~/stores/ui'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

// 모드 판별
const isEditMode = computed(() => route.params.id !== 'new')

// 상품 ID
const productId = computed(() => route.params.id)

// 로딩 상태
const isLoading = ref(false)

// 저장 상태
const isSaving = ref(false)

// 상품 데이터
const product = ref({
  name: '',
  description: '',
  detailContent: '', // 상세 페이지 HTML 콘텐츠
  categoryId: '', // 카테고리 ID
  price: 0,
  hasDiscount: false,
  discountType: 'percent',
  discountValue: 0,
  maxPurchase: 10,
  isNew: false,
  isPopular: false,
  isRecommend: false,
  status: 'active',
})

// 카테고리 목록 (Mock)
const categories = ref([
  { id: 'cat-1', name: '의류', children: [
    { id: 'cat-1-1', name: '상의' },
    { id: 'cat-1-2', name: '하의' },
    { id: 'cat-1-3', name: '아우터' },
  ]},
  { id: 'cat-2', name: '신발', children: [
    { id: 'cat-2-1', name: '운동화' },
    { id: 'cat-2-2', name: '구두' },
    { id: 'cat-2-3', name: '샌들' },
  ]},
  { id: 'cat-3', name: '가방', children: [
    { id: 'cat-3-1', name: '백팩' },
    { id: 'cat-3-2', name: '숄더백' },
    { id: 'cat-3-3', name: '크로스백' },
  ]},
  { id: 'cat-4', name: '액세서리', children: [
    { id: 'cat-4-1', name: '모자' },
    { id: 'cat-4-2', name: '벨트' },
    { id: 'cat-4-3', name: '시계' },
  ]},
])

// 카테고리 옵션 (플랫하게 변환)
const categoryOptions = computed(() => {
  const options = []
  categories.value.forEach((parent) => {
    options.push({ id: parent.id, name: parent.name, isParent: true })
    if (parent.children) {
      parent.children.forEach((child) => {
        options.push({ id: child.id, name: `  ${child.name}`, parentId: parent.id })
      })
    }
  })
  return options
})

// 대표 이미지
const mainImage = ref(null)

// 옵션 정의 (대분류/소분류)
const optionGroups = ref([])

// 옵션 조합 (variants)
const variants = ref([])
const isVariantsGenerated = ref(false)

// 벌크 선택
const selectedVariantIds = ref([])
const showBulkStockModal = ref(false)
const showBulkPriceModal = ref(false)
const bulkStockValue = ref(0)
const bulkPriceValue = ref(0)

// 옵션명 유효성 검사 (콤마 금지)
const validateOptionName = (name) => {
  return !name.includes(',')
}

// 옵션값 파싱 (콤마로 구분)
const parseOptionValues = (input) => {
  if (!input) return []
  return input
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

// 할인가 계산
const discountPrice = computed(() => {
  if (!product.value.hasDiscount || product.value.discountValue <= 0) {
    return product.value.price
  }
  if (product.value.discountType === 'percent') {
    return Math.floor(product.value.price * (1 - product.value.discountValue / 100))
  }
  return Math.max(0, product.value.price - product.value.discountValue)
})

// 할인율 계산
const discountRate = computed(() => {
  if (!product.value.hasDiscount || product.value.price <= 0) return 0
  return Math.round((1 - discountPrice.value / product.value.price) * 100)
})

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 대표 이미지 업로드
const handleMainImageUpload = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    mainImage.value = {
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }
  }
}

// 옵션 그룹 추가
const addOptionGroup = () => {
  optionGroups.value.push({
    id: Date.now(),
    name: '',
    valuesInput: '', // 콤마로 구분된 입력값
    nameError: false,
  })
  isVariantsGenerated.value = false
  variants.value = []
}

// 옵션 그룹 삭제
const removeOptionGroup = (index) => {
  optionGroups.value.splice(index, 1)
  isVariantsGenerated.value = false
  variants.value = []
}

// 옵션명 입력 핸들러 (콤마 제거)
const handleOptionNameInput = (group, event) => {
  const value = event.target.value
  if (value.includes(',')) {
    group.nameError = true
    group.name = value.replace(/,/g, '')
  } else {
    group.nameError = false
    group.name = value
  }
  isVariantsGenerated.value = false
  variants.value = []
}

// 옵션값 입력 변경 핸들러
const handleValuesInputChange = () => {
  isVariantsGenerated.value = false
  variants.value = []
}

// 벌크 선택: 전체 선택/해제
const handleSelectAllVariants = (selectAll) => {
  selectedVariantIds.value = selectAll ? variants.value.map((v) => v.id) : []
}

// 벌크 선택: 개별 선택
const handleSelectVariant = (id) => {
  const index = selectedVariantIds.value.indexOf(id)
  if (index > -1) {
    selectedVariantIds.value.splice(index, 1)
  } else {
    selectedVariantIds.value.push(id)
  }
}

// 벌크 선택: 선택 여부 확인
const isVariantSelected = (id) => selectedVariantIds.value.includes(id)

// 벌크 선택: 전체 선택 여부
const isAllVariantsSelected = computed(() => {
  return variants.value.length > 0 && selectedVariantIds.value.length === variants.value.length
})

// 벌크 액션: SKU 비우기
const handleBulkClearSku = () => {
  variants.value.forEach((v) => {
    if (selectedVariantIds.value.includes(v.id)) {
      v.sku = ''
    }
  })
  selectedVariantIds.value = []
  uiStore.showToast({ type: 'success', message: 'SKU가 초기화되었습니다.' })
}

// 벌크 액션: 재고 일괄 수정
const openBulkStockModal = () => {
  bulkStockValue.value = 0
  showBulkStockModal.value = true
}

const handleBulkStockUpdate = () => {
  variants.value.forEach((v) => {
    if (selectedVariantIds.value.includes(v.id)) {
      v.stock = bulkStockValue.value
    }
  })
  showBulkStockModal.value = false
  selectedVariantIds.value = []
  uiStore.showToast({ type: 'success', message: '재고가 일괄 수정되었습니다.' })
}

// 벌크 액션: 추가금액 일괄 수정
const openBulkPriceModal = () => {
  bulkPriceValue.value = 0
  showBulkPriceModal.value = true
}

const handleBulkPriceUpdate = () => {
  variants.value.forEach((v) => {
    if (selectedVariantIds.value.includes(v.id)) {
      v.additionalPrice = bulkPriceValue.value
    }
  })
  showBulkPriceModal.value = false
  selectedVariantIds.value = []
  uiStore.showToast({ type: 'success', message: '추가금액이 일괄 수정되었습니다.' })
}

// 옵션 조합 생성
const generateVariants = () => {
  // 각 그룹의 옵션값 파싱
  const parsedGroups = optionGroups.value
    .map((g) => ({
      name: g.name.trim(),
      values: parseOptionValues(g.valuesInput),
    }))
    .filter((g) => g.name && g.values.length > 0)

  if (parsedGroups.length === 0) {
    uiStore.showToast({ type: 'error', message: '옵션을 먼저 설정해주세요.' })
    return
  }

  // 카테시안 곱으로 모든 조합 생성
  const combinations = parsedGroups.reduce((acc, group) => {
    if (acc.length === 0) {
      return group.values.map((value) => [{ name: group.name, value }])
    }
    const newAcc = []
    acc.forEach((combo) => {
      group.values.forEach((value) => {
        newAcc.push([...combo, { name: group.name, value }])
      })
    })
    return newAcc
  }, [])

  // 조합별 variant 생성
  variants.value = combinations.map((combo, index) => ({
    id: Date.now() + index,
    options: combo,
    optionLabel: combo.map((o) => o.value).join(' / '),
    sku: '',
    stock: 0,
    additionalPrice: 0,
    images: [],
  }))

  isVariantsGenerated.value = true
  selectedVariantIds.value = []

  uiStore.showToast({
    type: 'success',
    message: `${variants.value.length}개의 옵션 조합이 생성되었습니다.`,
  })
}

// variant 이미지 업로드
const handleVariantImageUpload = (event, variant) => {
  const files = Array.from(event.target.files || [])
  files.forEach((file) => {
    if (variant.images.length < 5) {
      variant.images.push({
        id: Date.now() + Math.random(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      })
    }
  })
}

// variant 이미지 삭제
const removeVariantImage = (variant, imageIndex) => {
  URL.revokeObjectURL(variant.images[imageIndex].preview)
  variant.images.splice(imageIndex, 1)
}

// 전체 재고 합계
const totalStock = computed(() => {
  return variants.value.reduce((sum, v) => sum + (v.stock || 0), 0)
})

// 예상 조합 수
const expectedVariantCount = computed(() => {
  const parsedGroups = optionGroups.value
    .map((g) => ({
      name: g.name.trim(),
      values: parseOptionValues(g.valuesInput),
    }))
    .filter((g) => g.name && g.values.length > 0)

  if (parsedGroups.length === 0) return 0
  return parsedGroups.reduce((acc, g) => acc * g.values.length, 1)
})

// SKU 일괄 생성
const generateSkuBatch = () => {
  const prefix = product.value.name
    ? product.value.name.substring(0, 3).toUpperCase().replace(/\s/g, '')
    : 'PRD'

  variants.value.forEach((variant, index) => {
    const optionCode = variant.options
      .map((o) => o.value.substring(0, 2).toUpperCase())
      .join('-')
    variant.sku = `${prefix}-${optionCode}-${String(index + 1).padStart(3, '0')}`
  })

  uiStore.showToast({ type: 'success', message: 'SKU가 일괄 생성되었습니다.' })
}

// 유효성 검사
const validateForm = () => {
  if (!product.value.name.trim()) {
    uiStore.showToast({ type: 'error', message: '상품명을 입력해주세요.' })
    return false
  }

  if (!product.value.categoryId) {
    uiStore.showToast({ type: 'error', message: '카테고리를 선택해주세요.' })
    return false
  }

  if (product.value.price <= 0) {
    uiStore.showToast({ type: 'error', message: '판매가를 입력해주세요.' })
    return false
  }

  if (!isVariantsGenerated.value || variants.value.length === 0) {
    uiStore.showToast({ type: 'error', message: '옵션 조합을 생성해주세요.' })
    return false
  }

  const emptySkuVariant = variants.value.find((v) => !v.sku.trim())
  if (emptySkuVariant) {
    uiStore.showToast({ type: 'error', message: '모든 옵션 조합에 SKU를 입력해주세요.' })
    return false
  }

  return true
}

// 저장
const handleSave = async () => {
  if (!validateForm()) return

  isSaving.value = true

  const saveData = {
    ...product.value,
    discountPrice: discountPrice.value,
    mainImage: mainImage.value?.name || null,
    optionGroups: optionGroups.value
      .map((g) => ({ name: g.name.trim(), values: parseOptionValues(g.valuesInput) }))
      .filter((g) => g.name && g.values.length > 0),
    variants: variants.value.map((v) => ({
      options: v.options,
      sku: v.sku,
      stock: v.stock,
      additionalPrice: v.additionalPrice,
      images: v.images.map((img) => img.name),
    })),
    totalStock: totalStock.value,
  }

  console.log('상품 저장 데이터:', saveData)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  isSaving.value = false

  uiStore.showToast({
    type: 'success',
    message: isEditMode.value ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.',
  })

  router.push('/admin/products')
}

// 삭제 (수정 모드에서만)
const handleDelete = async () => {
  if (!confirm('이 상품을 삭제하시겠습니까?')) return
  await new Promise((resolve) => setTimeout(resolve, 300))
  uiStore.showToast({ type: 'success', message: '상품이 삭제되었습니다.' })
  router.push('/admin/products')
}

// 취소
const handleCancel = () => {
  router.push('/admin/products')
}

// 상태 옵션
const statusOptions = [
  { value: 'active', label: '판매중' },
  { value: 'inactive', label: '판매중지' },
]

// 상품 데이터 불러오기
const fetchProduct = async () => {
  isLoading.value = true

  // Mock API 호출
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock 데이터
  const mockProduct = {
    id: productId.value,
    name: '베이직 코튼 티셔츠',
    description: '부드러운 코튼 소재의 기본 티셔츠입니다. 다양한 스타일링에 활용하기 좋습니다.',
    detailContent: '<h2>상품 상세 정보</h2><p>고품질 면 100% 소재로 제작되었습니다.</p><p>사계절 내내 편안하게 착용 가능합니다.</p>',
    categoryId: 'cat-1-1',
    price: 29000,
    hasDiscount: true,
    discountType: 'percent',
    discountValue: 10,
    maxPurchase: 5,
    isNew: true,
    isPopular: false,
    isRecommend: true,
    status: 'active',
    mainImage: {
      preview: '/images/products/1.jpg',
      name: 'product-main.jpg',
    },
    optionGroups: [
      { name: '컬러', values: ['블랙', '화이트', '그레이'] },
      { name: '사이즈', values: ['S', 'M', 'L'] },
    ],
    variants: [
      { id: 1, options: [{ name: '컬러', value: '블랙' }, { name: '사이즈', value: 'S' }], optionLabel: '블랙 / S', sku: 'TS-BK-S-001', stock: 50, additionalPrice: 0, images: [] },
      { id: 2, options: [{ name: '컬러', value: '블랙' }, { name: '사이즈', value: 'M' }], optionLabel: '블랙 / M', sku: 'TS-BK-M-002', stock: 30, additionalPrice: 0, images: [] },
      { id: 3, options: [{ name: '컬러', value: '블랙' }, { name: '사이즈', value: 'L' }], optionLabel: '블랙 / L', sku: 'TS-BK-L-003', stock: 20, additionalPrice: 1000, images: [] },
      { id: 4, options: [{ name: '컬러', value: '화이트' }, { name: '사이즈', value: 'S' }], optionLabel: '화이트 / S', sku: 'TS-WH-S-004', stock: 40, additionalPrice: 0, images: [] },
      { id: 5, options: [{ name: '컬러', value: '화이트' }, { name: '사이즈', value: 'M' }], optionLabel: '화이트 / M', sku: 'TS-WH-M-005', stock: 25, additionalPrice: 0, images: [] },
      { id: 6, options: [{ name: '컬러', value: '화이트' }, { name: '사이즈', value: 'L' }], optionLabel: '화이트 / L', sku: 'TS-WH-L-006', stock: 15, additionalPrice: 1000, images: [] },
      { id: 7, options: [{ name: '컬러', value: '그레이' }, { name: '사이즈', value: 'S' }], optionLabel: '그레이 / S', sku: 'TS-GR-S-007', stock: 35, additionalPrice: 0, images: [] },
      { id: 8, options: [{ name: '컬러', value: '그레이' }, { name: '사이즈', value: 'M' }], optionLabel: '그레이 / M', sku: 'TS-GR-M-008', stock: 20, additionalPrice: 0, images: [] },
      { id: 9, options: [{ name: '컬러', value: '그레이' }, { name: '사이즈', value: 'L' }], optionLabel: '그레이 / L', sku: 'TS-GR-L-009', stock: 10, additionalPrice: 1000, images: [] },
    ],
  }

  // 데이터 바인딩
  product.value = {
    name: mockProduct.name,
    description: mockProduct.description,
    detailContent: mockProduct.detailContent,
    categoryId: mockProduct.categoryId,
    price: mockProduct.price,
    hasDiscount: mockProduct.hasDiscount,
    discountType: mockProduct.discountType,
    discountValue: mockProduct.discountValue,
    maxPurchase: mockProduct.maxPurchase,
    isNew: mockProduct.isNew,
    isPopular: mockProduct.isPopular,
    isRecommend: mockProduct.isRecommend,
    status: mockProduct.status,
  }

  mainImage.value = mockProduct.mainImage

  // 옵션 그룹 변환
  optionGroups.value = mockProduct.optionGroups.map((g, index) => ({
    id: Date.now() + index,
    name: g.name,
    valuesInput: g.values.join(', '),
    nameError: false,
  }))

  // variants 설정
  variants.value = mockProduct.variants
  isVariantsGenerated.value = true

  isLoading.value = false
}

// 초기 로드
onMounted(() => {
  if (isEditMode.value) {
    fetchProduct()
  }
})
</script>

<template>
  <LayoutFormPage
    :title="isEditMode ? (product.name ? `${product.name} 수정` : '상품 수정') : '상품 등록'"
    :description="isEditMode ? '상품 정보를 수정합니다.' : '새 상품을 등록합니다.'"
    save-text="저장"
    :is-saving="isSaving"
    :save-disabled="isLoading"
    show-cancel
    @save="handleSave"
    @cancel="handleCancel"
  >
    <template v-if="isEditMode" #footer-left>
      <UiButton variant="danger" :disabled="isSaving" @click="handleDelete">삭제</UiButton>
    </template>
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <div v-else class="space-y-6">
      <!-- 기본 정보 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">기본 정보</h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              상품명 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="product.name"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="상품명을 입력하세요"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              상품 설명
            </label>
            <textarea
              v-model="product.description"
              rows="4"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="상품에 대한 상세 설명을 입력하세요"
            />
          </div>
        </div>
      </UiCard>

      <!-- 대표 이미지 & 카테고리 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 대표 이미지 (좌) -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">대표 이미지</h3>
            <p class="text-sm text-neutral-500 mt-1">상품 목록에 표시되는 메인 이미지입니다.</p>
          </template>

          <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6">
            <div v-if="mainImage" class="flex items-center gap-4">
              <div class="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden">
                <img :src="mainImage.preview" :alt="mainImage.name" class="w-full h-full object-cover">
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-neutral-900">{{ mainImage.name }}</p>
                <button
                  type="button"
                  class="text-sm text-error-600 hover:text-error-700 mt-2"
                  @click="mainImage = null"
                >
                  삭제
                </button>
              </div>
            </div>
            <div v-else class="text-center">
              <svg class="w-10 h-10 mx-auto text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <label class="cursor-pointer">
                <span class="text-sm text-primary-600 hover:text-primary-700 font-medium">이미지 업로드</span>
                <input type="file" accept="image/*" class="hidden" @change="handleMainImageUpload">
              </label>
              <p class="text-xs text-neutral-500 mt-1">권장: 800x800px, JPG/PNG</p>
            </div>
          </div>
        </UiCard>

        <!-- 카테고리 (우) -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">카테고리</h3>
            <p class="text-sm text-neutral-500 mt-1">상품이 속할 카테고리를 선택하세요.</p>
          </template>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              카테고리 선택 <span class="text-error-500">*</span>
            </label>
            <select
              v-model="product.categoryId"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">카테고리를 선택하세요</option>
              <template v-for="option in categoryOptions" :key="option.id">
                <option
                  v-if="option.isParent"
                  :value="option.id"
                  disabled
                  class="font-semibold text-neutral-900 bg-neutral-100"
                >
                  {{ option.name }}
                </option>
                <option v-else :value="option.id">
                  {{ option.name }}
                </option>
              </template>
            </select>
            <p class="text-xs text-neutral-500 mt-2">
              선택된 카테고리에 따라 상품이 분류됩니다.
            </p>
          </div>
        </UiCard>
      </div>

      <!-- 가격/할인 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">가격 설정</h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              판매가 <span class="text-error-500">*</span>
            </label>
            <div class="relative w-full md:w-48">
              <input
                v-model.number="product.price"
                type="number"
                min="0"
                class="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              >
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">원</span>
            </div>
            <p class="text-xs text-neutral-500 mt-1">옵션별 추가금액은 옵션 조합에서 설정합니다.</p>
          </div>

          <!-- 할인 -->
          <div class="border-t border-neutral-200 pt-4">
            <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900 text-sm">할인 적용</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="product.hasDiscount" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>

            <div v-if="product.hasDiscount" class="mt-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">할인 종류</label>
                  <select
                    v-model="product.discountType"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="percent">퍼센트 (%)</option>
                    <option value="amount">금액 (원)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">
                    {{ product.discountType === 'percent' ? '할인율' : '할인금액' }}
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="product.discountValue"
                      type="number"
                      min="0"
                      :max="product.discountType === 'percent' ? 100 : product.price"
                      class="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                    >
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                      {{ product.discountType === 'percent' ? '%' : '원' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="p-3 bg-primary-50 rounded-lg flex items-center justify-between">
                <div>
                  <p class="text-xs text-neutral-600">할인가</p>
                  <p class="text-lg font-bold text-primary-600">{{ formatCurrency(discountPrice) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs text-neutral-500 line-through">{{ formatCurrency(product.price) }}</p>
                  <p class="text-sm font-medium text-error-600">-{{ discountRate }}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- 옵션 설정 -->
      <UiCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-neutral-900">옵션 설정</h3>
              <p class="text-sm text-neutral-500 mt-1">컬러, 사이즈 등 옵션을 설정합니다.</p>
            </div>
            <UiButton variant="outline" size="sm" @click="addOptionGroup">
              옵션 추가
            </UiButton>
          </div>
        </template>

        <div v-if="optionGroups.length === 0" class="text-center py-6">
          <p class="text-neutral-500 text-sm">등록된 옵션이 없습니다.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(group, index) in optionGroups"
            :key="group.id"
            class="p-4 border border-neutral-200 rounded-lg"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-neutral-700">옵션 {{ index + 1 }}</span>
              <button
                type="button"
                class="text-sm text-error-600 hover:text-error-700"
                @click="removeOptionGroup(index)"
              >
                삭제
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="flex items-center gap-1 mb-1">
                  <label class="block text-xs font-medium text-neutral-600">
                    옵션명 (대분류)
                  </label>
                  <div class="relative group">
                    <svg class="w-3.5 h-3.5 text-neutral-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                      옵션명에는 콤마(,)를 사용할 수 없습니다
                      <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                    </div>
                  </div>
                </div>
                <input
                  :value="group.name"
                  type="text"
                  :class="[
                    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2',
                    group.nameError
                      ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
                      : 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500'
                  ]"
                  placeholder="예: 컬러"
                  @input="handleOptionNameInput(group, $event)"
                >
                <p v-if="group.nameError" class="text-xs text-error-500 mt-1">
                  옵션명에는 콤마(,)를 사용할 수 없습니다
                </p>
              </div>

              <div>
                <div class="flex items-center gap-1 mb-1">
                  <label class="block text-xs font-medium text-neutral-600">
                    옵션값 (소분류)
                  </label>
                  <div class="relative group">
                    <svg class="w-3.5 h-3.5 text-neutral-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                      콤마(,)로 구분하여 여러 값을 입력하세요
                      <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                    </div>
                  </div>
                </div>
                <input
                  v-model="group.valuesInput"
                  type="text"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="예: 블랙, 화이트, 그레이"
                  @input="handleValuesInputChange"
                >
                <p class="text-xs text-neutral-500 mt-1">
                  콤마(,)로 구분하여 입력
                </p>
              </div>
            </div>

            <!-- 입력된 옵션값 미리보기 -->
            <div v-if="parseOptionValues(group.valuesInput).length > 0" class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="(value, valueIndex) in parseOptionValues(group.valuesInput)"
                :key="valueIndex"
                class="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 rounded text-sm"
              >
                {{ value }}
              </span>
            </div>
          </div>

          <!-- 조합 생성 버튼 -->
          <div v-if="expectedVariantCount > 0" class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
            <p class="text-sm text-neutral-600">
              <span class="font-semibold text-neutral-900">{{ expectedVariantCount }}개</span>의 조합이 생성됩니다.
            </p>
            <UiButton variant="primary" size="sm" @click="generateVariants">
              옵션 조합 생성
            </UiButton>
          </div>
        </div>
      </UiCard>

      <!-- 옵션 조합 테이블 -->
      <UiCard v-if="isVariantsGenerated && variants.length > 0">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-neutral-900">옵션 조합</h3>
              <p class="text-sm text-neutral-500 mt-1">
                총 {{ variants.length }}개 조합 / 총 재고 {{ totalStock }}개
              </p>
            </div>
            <UiButton variant="outline" size="sm" @click="generateSkuBatch">
              SKU 일괄 생성
            </UiButton>
          </div>
        </template>

        <!-- 벌크 액션 바 -->
        <div
          v-if="selectedVariantIds.length > 0"
          class="flex items-center gap-3 p-3 mb-4 bg-primary-50 border border-primary-200 rounded-lg"
        >
          <span class="text-sm font-medium text-primary-700">
            {{ selectedVariantIds.length }}개 선택됨
          </span>
          <div class="flex-1" />
          <UiButton variant="ghost" size="sm" @click="handleBulkClearSku">
            SKU 비우기
          </UiButton>
          <UiButton variant="ghost" size="sm" @click="openBulkStockModal">
            재고 일괄수정
          </UiButton>
          <UiButton variant="ghost" size="sm" @click="openBulkPriceModal">
            추가금액 일괄수정
          </UiButton>
          <UiButton variant="ghost" size="sm" @click="selectedVariantIds = []">
            선택 해제
          </UiButton>
        </div>

        <!-- 데스크톱 테이블 -->
        <div class="hidden md:block overflow-x-auto -mx-4 md:-mx-6">
          <table class="w-full">
            <thead>
              <tr class="border-b border-neutral-200 bg-neutral-50">
                <th class="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    :checked="isAllVariantsSelected"
                    class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    @change="handleSelectAllVariants($event.target.checked)"
                  >
                </th>
                <th class="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">옵션</th>
                <th class="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase w-36">SKU *</th>
                <th class="text-center py-3 px-4 text-xs font-medium text-neutral-500 uppercase w-24">재고</th>
                <th class="text-center py-3 px-4 text-xs font-medium text-neutral-500 uppercase w-28">추가금액</th>
                <th class="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase w-44">이미지</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="variant in variants"
                :key="variant.id"
                :class="[
                  'border-b border-neutral-100',
                  isVariantSelected(variant.id) ? 'bg-primary-50' : 'hover:bg-neutral-50'
                ]"
              >
                <td class="py-3 px-4">
                  <input
                    type="checkbox"
                    :checked="isVariantSelected(variant.id)"
                    class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    @change="handleSelectVariant(variant.id)"
                  >
                </td>
                <td class="py-3 px-4">
                  <span class="text-sm font-medium text-neutral-900">{{ variant.optionLabel }}</span>
                </td>
                <td class="py-3 px-4">
                  <input
                    v-model="variant.sku"
                    type="text"
                    class="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="SKU"
                  >
                </td>
                <td class="py-3 px-4">
                  <input
                    v-model.number="variant.stock"
                    type="number"
                    min="0"
                    class="w-full px-2 py-1.5 border border-neutral-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  >
                </td>
                <td class="py-3 px-4">
                  <div class="relative">
                    <input
                      v-model.number="variant.additionalPrice"
                      type="number"
                      class="w-full px-2 py-1.5 pr-6 border border-neutral-300 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0"
                    >
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-400">원</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="flex gap-1">
                      <div
                        v-for="(img, imgIndex) in variant.images.slice(0, 3)"
                        :key="img.id"
                        class="relative w-8 h-8 bg-neutral-100 rounded overflow-hidden group"
                      >
                        <img :src="img.preview" class="w-full h-full object-cover">
                        <button
                          type="button"
                          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          @click="removeVariantImage(variant, imgIndex)"
                        >
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <span v-if="variant.images.length > 3" class="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center text-xs text-neutral-500">
                        +{{ variant.images.length - 3 }}
                      </span>
                    </div>
                    <label v-if="variant.images.length < 5" class="cursor-pointer text-xs text-primary-600 hover:text-primary-700">
                      추가
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="(e) => handleVariantImageUpload(e, variant)"
                      >
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 모바일 카드 -->
        <div class="md:hidden space-y-3">
          <!-- 모바일 전체 선택 -->
          <div class="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
            <input
              type="checkbox"
              :checked="isAllVariantsSelected"
              class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              @change="handleSelectAllVariants($event.target.checked)"
            >
            <span class="text-sm text-neutral-600">전체 선택</span>
          </div>

          <div
            v-for="variant in variants"
            :key="variant.id"
            :class="[
              'p-3 border rounded-lg',
              isVariantSelected(variant.id) ? 'border-primary-300 bg-primary-50' : 'border-neutral-200'
            ]"
          >
            <div class="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                :checked="isVariantSelected(variant.id)"
                class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                @change="handleSelectVariant(variant.id)"
              >
              <p class="font-medium text-neutral-900 text-sm">{{ variant.optionLabel }}</p>
            </div>

            <div class="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label class="block text-xs text-neutral-500 mb-1">SKU</label>
                <input
                  v-model="variant.sku"
                  type="text"
                  class="w-full px-2 py-1 border border-neutral-300 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="SKU"
                >
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">재고</label>
                <input
                  v-model.number="variant.stock"
                  type="number"
                  min="0"
                  class="w-full px-2 py-1 border border-neutral-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="0"
                >
              </div>
              <div>
                <label class="block text-xs text-neutral-500 mb-1">추가금액</label>
                <input
                  v-model.number="variant.additionalPrice"
                  type="number"
                  class="w-full px-2 py-1 border border-neutral-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="0"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs text-neutral-500 mb-1">이미지 ({{ variant.images.length }}/5)</label>
              <div class="flex items-center gap-1.5 flex-wrap">
                <div
                  v-for="(img, imgIndex) in variant.images"
                  :key="img.id"
                  class="relative w-10 h-10 bg-neutral-100 rounded overflow-hidden"
                >
                  <img :src="img.preview" class="w-full h-full object-cover">
                  <button
                    type="button"
                    class="absolute top-0 right-0 p-0.5 bg-error-500 text-white rounded-bl"
                    @click="removeVariantImage(variant, imgIndex)"
                  >
                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <label v-if="variant.images.length < 5" class="w-10 h-10 border border-dashed border-neutral-300 rounded flex items-center justify-center cursor-pointer">
                  <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden"
                    @change="(e) => handleVariantImageUpload(e, variant)"
                  >
                </label>
              </div>
            </div>
          </div>
        </div>
      </UiCard>

      <!-- 상세 페이지 -->
      <UiCard>
        <template #header>
          <div>
            <h3 class="font-semibold text-neutral-900">상세 페이지</h3>
            <p class="text-sm text-neutral-500 mt-1">상품 상세 페이지에 표시될 내용을 작성합니다. (권장 이미지 너비: 860px)</p>
          </div>
        </template>
        <UiRichEditor
          v-model="product.detailContent"
          placeholder="상품 상세 내용을 입력하세요..."
          min-height="500px"
        />
      </UiCard>

      <!-- 판매 설정 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">판매 설정</h3>
        </template>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">판매 상태</label>
              <select
                v-model="product.status"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                1인당 최대 구매 수량
              </label>
              <div class="relative">
                <input
                  v-model.number="product.maxPurchase"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="10"
                >
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">개</span>
              </div>
              <p class="text-xs text-neutral-500 mt-1">0 입력 시 제한 없음</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">상품 태그</label>
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="product.isNew"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                >
                <span class="text-sm text-neutral-700">신상품</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="product.isPopular"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                >
                <span class="text-sm text-neutral-700">인기상품</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="product.isRecommend"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                >
                <span class="text-sm text-neutral-700">추천상품</span>
              </label>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- 재고 일괄 수정 모달 -->
    <UiModal
      v-model="showBulkStockModal"
      title="재고 일괄 수정"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        선택한 <span class="font-medium text-neutral-900">{{ selectedVariantIds.length }}개</span> 옵션의 재고를 일괄 수정합니다.
      </p>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">재고 수량</label>
        <div class="relative">
          <input
            v-model.number="bulkStockValue"
            type="number"
            min="0"
            class="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="0"
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">개</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" @click="showBulkStockModal = false">
            취소
          </UiButton>
          <UiButton variant="primary" @click="handleBulkStockUpdate">
            적용
          </UiButton>
        </div>
      </template>
    </UiModal>

    <!-- 추가금액 일괄 수정 모달 -->
    <UiModal
      v-model="showBulkPriceModal"
      title="추가금액 일괄 수정"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        선택한 <span class="font-medium text-neutral-900">{{ selectedVariantIds.length }}개</span> 옵션의 추가금액을 일괄 수정합니다.
      </p>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">추가금액</label>
        <div class="relative">
          <input
            v-model.number="bulkPriceValue"
            type="number"
            class="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="0"
          >
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">원</span>
        </div>
        <p class="text-xs text-neutral-500 mt-1">기본 판매가에 추가되는 금액입니다.</p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" @click="showBulkPriceModal = false">
            취소
          </UiButton>
          <UiButton variant="primary" @click="handleBulkPriceUpdate">
            적용
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutFormPage>
</template>
