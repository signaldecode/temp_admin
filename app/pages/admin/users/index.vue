<script setup>
/**
 * 회원 목록 페이지
 * - 검색: userID, 이름, 연락처
 * - 벌크 선택 + 등급 변경
 * - 페이지네이션 (30개)
 */

const router = useRouter()
const route = useRoute()

// 검색 필터
const filterGrade = ref('')
const searchType = ref('name')
const searchKeyword = ref('')

const searchOptions = [
  { value: 'userId', label: '회원 ID' },
  { value: 'name', label: '이름' },
  { value: 'phone', label: '연락처' },
]

// 로딩 상태
const isLoading = ref(false)

// 페이지네이션
const currentPage = ref(1)
const perPage = 30
const totalItems = ref(0)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage))

// 회원 목록
const users = ref([])

// 벌크 선택
const selectedIds = ref([])
const isAllSelected = computed(() => {
  return users.value.length > 0 && selectedIds.value.length === users.value.length
})
const isPartialSelected = computed(() => {
  return selectedIds.value.length > 0 && selectedIds.value.length < users.value.length
})

// 등급 변경 모달
const showGradeModal = ref(false)
const selectedGrade = ref('')

// 등급 옵션
const gradeOptions = [
  { value: 'VVIP', label: 'VVIP' },
  { value: 'VIP', label: 'VIP' },
  { value: '일반', label: '일반' },
]

// Mock 데이터 로드
const fetchUsers = async () => {
  isLoading.value = true

  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 300))

  // 전체 Mock 데이터
  const allUsers = [
    { id: 1, userId: 'user001', name: '김철수', phone: '010-1234-5678', email: 'kim@example.com', grade: 'VIP', status: 'active', createdAt: '2024-01-15', orderCount: 45, totalSpent: 1250000 },
    { id: 2, userId: 'user002', name: '이영희', phone: '010-2345-6789', email: 'lee@example.com', grade: '일반', status: 'active', createdAt: '2024-02-20', orderCount: 12, totalSpent: 340000 },
    { id: 3, userId: 'user003', name: '박민수', phone: '010-3456-7890', email: 'park@example.com', grade: '일반', status: 'active', createdAt: '2024-03-10', orderCount: 8, totalSpent: 180000 },
    { id: 4, userId: 'user004', name: '정수진', phone: '010-4567-8901', email: 'jung@example.com', grade: 'VIP', status: 'active', createdAt: '2024-03-25', orderCount: 67, totalSpent: 2890000 },
    { id: 5, userId: 'user005', name: '최동욱', phone: '010-5678-9012', email: 'choi@example.com', grade: '일반', status: 'dormant', createdAt: '2023-11-05', orderCount: 3, totalSpent: 89000 },
    { id: 6, userId: 'user006', name: '강미영', phone: '010-6789-0123', email: 'kang@example.com', grade: 'VVIP', status: 'active', createdAt: '2023-06-12', orderCount: 156, totalSpent: 8750000 },
    { id: 7, userId: 'user007', name: '윤서준', phone: '010-7890-1234', email: 'yoon@example.com', grade: '일반', status: 'active', createdAt: '2024-05-08', orderCount: 5, totalSpent: 125000 },
    { id: 8, userId: 'user008', name: '임지현', phone: '010-8901-2345', email: 'lim@example.com', grade: 'VIP', status: 'active', createdAt: '2024-01-22', orderCount: 38, totalSpent: 980000 },
    { id: 9, userId: 'user009', name: '한승우', phone: '010-9012-3456', email: 'han@example.com', grade: '일반', status: 'withdrawn', createdAt: '2023-09-15', orderCount: 2, totalSpent: 45000 },
    { id: 10, userId: 'user010', name: '오세영', phone: '010-0123-4567', email: 'oh@example.com', grade: '일반', status: 'active', createdAt: '2024-06-01', orderCount: 1, totalSpent: 32000 },
    // 더미 데이터 추가 (페이지네이션 테스트용)
    ...Array.from({ length: 85 }, (_, i) => ({
      id: 11 + i,
      userId: `user${String(11 + i).padStart(3, '0')}`,
      name: `테스트 회원 ${11 + i}`,
      phone: `010-${String(1000 + i).slice(-4)}-${String(5000 + i).slice(-4)}`,
      email: `test${11 + i}@example.com`,
      grade: ['일반', 'VIP', 'VVIP'][i % 3],
      status: ['active', 'dormant'][i % 5 === 0 ? 1 : 0],
      createdAt: '2024-01-01',
      orderCount: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 1000000),
    })),
  ]

  // 등급 필터링
  let filtered = allUsers
  if (filterGrade.value) {
    filtered = filtered.filter((user) => user.grade === filterGrade.value)
  }

  // 검색 필터링
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter((user) => {
      switch (searchType.value) {
        case 'userId':
          return user.userId.toLowerCase().includes(keyword)
        case 'name':
          return user.name.toLowerCase().includes(keyword)
        case 'phone':
          return user.phone.replace(/-/g, '').includes(keyword.replace(/-/g, ''))
        default:
          return true
      }
    })
  }

  totalItems.value = filtered.length

  // 페이지네이션
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  users.value = filtered.slice(start, end)

  // 페이지 변경 시 선택 초기화
  selectedIds.value = []

  isLoading.value = false
}

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

// 금액 포맷
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ko-KR').format(value) + '원'
}

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 검색 초기화
const handleReset = () => {
  filterGrade.value = ''
  searchType.value = 'name'
  searchKeyword.value = ''
  currentPage.value = 1
  fetchUsers()
}

// 페이지 변경
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

// 테이블 컬럼 정의
const tableColumns = [
  { key: 'userId', label: '회원ID' },
  { key: 'name', label: '이름' },
  { key: 'phone', label: '연락처' },
  { key: 'email', label: '이메일' },
  { key: 'grade', label: '등급', align: 'center' },
  { key: 'status', label: '상태', align: 'center' },
  { key: 'orderCount', label: '주문수', align: 'right' },
  { key: 'totalSpent', label: '총 주문금액', align: 'right' },
  { key: 'createdAt', label: '가입일' },
]

// 전체 선택/해제
const handleSelectAll = (selectAll) => {
  if (selectAll) {
    selectedIds.value = users.value.map((u) => u.id)
  } else {
    selectedIds.value = []
  }
}

// 개별 선택
const handleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 등급 변경 모달 열기
const openGradeModal = () => {
  selectedGrade.value = ''
  showGradeModal.value = true
}

// 등급 변경 실행
const handleGradeChange = async () => {
  if (!selectedGrade.value) return

  // 실제로는 API 호출
  console.log('등급 변경:', selectedIds.value, '→', selectedGrade.value)

  // Mock: 로컬 데이터 업데이트
  users.value = users.value.map((user) => {
    if (selectedIds.value.includes(user.id)) {
      return { ...user, grade: selectedGrade.value }
    }
    return user
  })

  showGradeModal.value = false
  selectedIds.value = []

  // 성공 알림 (UI Store 사용)
  const uiStore = useUiStore()
  uiStore.showToast({
    type: 'success',
    message: `${selectedIds.value.length || '선택한'}명의 회원 등급이 변경되었습니다.`,
  })
}

// 회원 상세로 이동
const goToDetail = (userId) => {
  router.push(`/admin/users/${userId}`)
}

// 초기 로드
onMounted(() => {
  if (route.query.type) searchType.value = route.query.type
  if (route.query.keyword) searchKeyword.value = route.query.keyword
  if (route.query.page) currentPage.value = parseInt(route.query.page) || 1
  fetchUsers()
})

// import
import { useUiStore } from '~/stores/ui'
</script>

<template>
  <LayoutListPage title="회원 목록">
    <!-- Description -->
    <template #description>
      전체 회원 {{ totalItems.toLocaleString() }}명
    </template>

    <!-- Filters -->
    <template #filters>
      <DomainFilterCard @search="handleSearch" @reset="handleReset">
        <template #selects>
          <select
            v-model="filterGrade"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">등급 전체</option>
            <option v-for="option in gradeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select
            v-model="searchType"
            class="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option v-for="option in searchOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </template>
        <template #search>
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="`${searchOptions.find(o => o.value === searchType)?.label}(으)로 검색`"
            class="flex-1 min-w-0 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            @keyup.enter="handleSearch"
          >
        </template>
      </DomainFilterCard>
    </template>

    <!-- Bulk Actions -->
    <template #bulk>
      <DomainBulkActionBar :count="selectedIds.length" :show="selectedIds.length > 0">
        <UiButton variant="primary" size="sm" @click="openGradeModal">
          등급 변경
        </UiButton>
        <UiButton variant="ghost" size="sm" @click="selectedIds = []">
          선택 해제
        </UiButton>
      </DomainBulkActionBar>
    </template>

    <!-- Loading -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center bg-white rounded-lg border border-neutral-200">
      <UiSpinner size="lg" />
    </div>

    <!-- User List -->
    <DomainDataTable
      v-else
      :columns="tableColumns"
      :items="users"
      :selected-ids="selectedIds"
      selectable
      empty-title="검색 결과가 없습니다"
      empty-description="다른 검색어로 다시 시도해보세요."
      @select="handleSelect"
      @select-all="handleSelectAll"
      @row-click="(user) => goToDetail(user.id)"
    >
      <!-- 회원ID -->
      <template #cell-userId="{ item }">
        <span class="text-sm font-medium text-primary-600">{{ item.userId }}</span>
      </template>

      <!-- 이름 -->
      <template #cell-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ item.name }}</span>
      </template>

      <!-- 연락처 -->
      <template #cell-phone="{ item }">
        <span class="text-sm text-neutral-600">{{ item.phone }}</span>
      </template>

      <!-- 이메일 -->
      <template #cell-email="{ item }">
        <span class="text-sm text-neutral-600">{{ item.email }}</span>
      </template>

      <!-- 등급 -->
      <template #cell-grade="{ item }">
        <UiBadge :variant="gradeVariant[item.grade] || 'neutral'" size="sm">
          {{ item.grade }}
        </UiBadge>
      </template>

      <!-- 상태 -->
      <template #cell-status="{ item }">
        <UiBadge :variant="statusMap[item.status].variant" size="sm" dot>
          {{ statusMap[item.status].label }}
        </UiBadge>
      </template>

      <!-- 주문수 -->
      <template #cell-orderCount="{ item }">
        <span class="text-sm text-neutral-700">{{ item.orderCount }}건</span>
      </template>

      <!-- 총 주문금액 -->
      <template #cell-totalSpent="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ formatCurrency(item.totalSpent) }}</span>
      </template>

      <!-- 가입일 -->
      <template #cell-createdAt="{ item }">
        <span class="text-sm text-neutral-500">{{ item.createdAt }}</span>
      </template>

      <!-- 모바일 카드 -->
      <template #mobile-card="{ item }">
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-sm font-medium text-primary-600">{{ item.userId }}</span>
            <h3 class="text-base font-semibold text-neutral-900">{{ item.name }}</h3>
          </div>
          <div class="flex gap-1">
            <UiBadge :variant="gradeVariant[item.grade] || 'neutral'" size="sm">
              {{ item.grade }}
            </UiBadge>
            <UiBadge :variant="statusMap[item.status].variant" size="sm">
              {{ statusMap[item.status].label }}
            </UiBadge>
          </div>
        </div>
        <div class="text-sm text-neutral-600 space-y-1">
          <p>{{ item.phone }}</p>
          <p>{{ item.email }}</p>
        </div>
        <div class="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
          <span class="text-sm text-neutral-500">주문 {{ item.orderCount }}건</span>
          <span class="text-sm font-medium text-neutral-900">{{ formatCurrency(item.totalSpent) }}</span>
        </div>
      </template>

      <!-- Empty action -->
      <template #empty>
        <UiButton variant="outline" size="sm" @click="handleReset">
          검색 초기화
        </UiButton>
      </template>
    </DomainDataTable>

    <!-- Pagination -->
    <template #pagination>
      <UiPagination
        v-if="totalPages > 0 && !isLoading"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="perPage"
        @change="handlePageChange"
      />
    </template>

    <!-- Grade Change Modal -->
    <UiModal
      v-model="showGradeModal"
      title="회원 등급 변경"
      size="sm"
    >
      <p class="text-sm text-neutral-600 mb-4">
        선택한 <span class="font-medium text-neutral-900">{{ selectedIds.length }}명</span>의 회원 등급을 변경합니다.
      </p>

      <div class="space-y-2">
        <label
          v-for="option in gradeOptions"
          :key="option.value"
          :class="[
            'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
            selectedGrade === option.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-neutral-300',
          ]"
        >
          <input
            v-model="selectedGrade"
            type="radio"
            :value="option.value"
            class="w-4 h-4 text-primary-600 focus:ring-primary-500"
          >
          <span class="font-medium">{{ option.label }}</span>
          <UiBadge :variant="gradeVariant[option.value]" size="sm" class="ml-auto">
            {{ option.label }}
          </UiBadge>
        </label>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton
            variant="outline"
            @click="showGradeModal = false"
          >
            취소
          </UiButton>
          <UiButton
            variant="primary"
            :disabled="!selectedGrade"
            @click="handleGradeChange"
          >
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutListPage>
</template>
