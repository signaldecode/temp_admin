<script setup>
/**
 * FAQ 목록 페이지
 */

import { useUiStore } from '~/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

const categoryOptions = [
  { value: 'order', label: '주문/결제' },
  { value: 'shipping', label: '배송' },
  { value: 'return', label: '교환/반품' },
  { value: 'member', label: '회원' },
  { value: 'etc', label: '기타' },
]

const faqs = ref([
  { id: 1, question: '배송비는 얼마인가요?', category: 'shipping', status: 'published', answer: '기본 배송비는 3,000원이며, 50,000원 이상 구매 시 무료배송입니다.\n\n제주 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.', order: 1 },
  { id: 2, question: '반품은 어떻게 하나요?', category: 'return', status: 'published', answer: '반품은 교환/반품 페이지에서 신청할 수 있습니다.\n\n반품 신청 시 반품 사유, 반품 상품 정보를 입력해주세요.', order: 2 },
  { id: 3, question: '결제 수단은 무엇이 있나요?', category: 'order', status: 'published', answer: '결제 수단은 카드, 계좌이체, 무통장 입금, 휴대폰 결제 등이 있습니다.\n\n결제 수단은 주문 페이지에서 확인할 수 있습니다.', order: 3 },
  { id: 4, question: '회원 탈퇴는 어떻게 하나요?', category: 'member', status: 'draft', answer: '회원 탈퇴는 회원 정보 페이지에서 신청할 수 있습니다.\n\n회원 탈퇴 시 회원 정보, 회원 탈퇴 사유를 입력해주세요.', order: 4 },
])

const filterCategory = ref('')
const searchKeyword = ref('')

const filteredFaqs = computed(() => {
  let result = [...faqs.value]
  if (filterCategory.value) result = result.filter((f) => f.category === filterCategory.value)
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter((f) => f.question.toLowerCase().includes(keyword))
  }
  return result.sort((a, b) => a.order - b.order)
})

const tableColumns = [
  { key: 'category', label: '분류', width: 'w-24' },
  { key: 'question', label: '질문' },
  { key: 'answer', label: '답변' },
]

const selectedIds = ref([])
const handleSelectAll = (selectAll) => { selectedIds.value = selectAll ? paginatedFaqs.value.map((f) => f.id) : [] }
const handleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  idx > -1 ? selectedIds.value.splice(idx, 1) : selectedIds.value.push(id)
}

const bulkDelete = () => {
  if (!selectedIds.value.length || !confirm(`선택한 ${selectedIds.value.length}개를 삭제하시겠습니까?`)) return
  faqs.value = faqs.value.filter((f) => !selectedIds.value.includes(f.id))
  selectedIds.value = []
  uiStore.showToast({ type: 'success', message: '삭제되었습니다.' })
}

const getCategoryLabel = (category) => categoryOptions.find((c) => c.value === category)?.label || category

const goToCreate = () => router.push('/admin/contents/faq/new')
const goToDetail = (faq) => router.push(`/admin/contents/faq/${faq.id}`)

const handleSearch = () => { currentPage.value = 1 }
const handleReset = () => {
  filterCategory.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

const currentPage = ref(1)
const perPage = 30
const totalPages = computed(() => Math.ceil(filteredFaqs.value.length / perPage))
const paginatedFaqs = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredFaqs.value.slice(start, start + perPage)
})
</script>

<template>
  <LayoutListPage title="FAQ 관리" description="자주 묻는 질문을 관리합니다.">
    <template #actions>
      <UiButton variant="primary" @click="goToCreate">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        FAQ 등록
      </UiButton>
    </template>

    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select v-model="filterCategory" class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">분류 전체</option>
            <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </template>
        <template #search>
          <input v-model="searchKeyword" type="text" placeholder="질문으로 검색" class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @keyup.enter="handleSearch">
        </template>
      </DomainFilterCard>
    </template>

    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="danger" size="sm" @click="bulkDelete">삭제</UiButton>
      </DomainBulkActionBar>
    </template>

    <DomainDataTable :columns="tableColumns" :items="paginatedFaqs" :selected-ids="selectedIds" selectable empty-title="등록된 FAQ가 없습니다" @select="handleSelect" @select-all="handleSelectAll" @row-click="goToDetail">
      <template #cell-order="{ item }">
        <span class="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">{{ item.order }}</span>
      </template>
      <template #cell-question="{ item }"><p class="text-sm font-medium text-neutral-900">{{ item.question }}</p></template>
      <template #cell-category="{ item }"><span class="text-sm text-neutral-600">{{ getCategoryLabel(item.category) }}</span></template>
      <template #cell-status="{ item }">
        <UiBadge :variant="item.status === 'published' ? 'success' : 'warning'" size="sm">{{ item.status === 'published' ? '게시중' : '임시저장' }}</UiBadge>
      </template>
      <template #mobile-card="{ item }">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-5 h-5 flex items-center justify-center bg-neutral-100 rounded text-xs font-medium text-neutral-600">{{ item.order }}</span>
          <p class="text-sm font-medium text-neutral-900 truncate flex-1">{{ item.question }}</p>
          <UiBadge :variant="item.status === 'published' ? 'success' : 'warning'" size="sm">{{ item.status === 'published' ? '게시' : '임시' }}</UiBadge>
        </div>
        <p class="text-xs text-neutral-400">{{ getCategoryLabel(item.category) }}</p>
      </template>
    </DomainDataTable>

    <template #pagination>
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" :total-items="filteredFaqs.length" :per-page="perPage" />
    </template>
  </LayoutListPage>
</template>
