<script setup>
/**
 * 카테고리 관리 페이지
 * - 대분류/소분류 2단계 구조
 * - 인라인 추가/수정
 * - 드래그앤드롭 순서 변경
 * - 모든 변경사항은 저장 버튼으로 일괄 저장
 * - Self-referencing 단일 테이블 구조
 */

import draggable from 'vuedraggable'
import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 로딩 상태
const isLoading = ref(true)
const isSaving = ref(false)

// 카테고리 데이터 (작업용)
const categories = ref([])

// 원본 데이터 (변경 감지용, JSON 문자열로 저장)
const originalData = ref('')

// 새 카테고리 입력값
const newParentName = ref('')
const newChildNames = ref({}) // { parentId: '입력값' }

// 수정 모드
const editingId = ref(null)
const editingName = ref('')

// 삭제 확인 모달
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

// 드래그 가능 대분류 목록
const draggableParents = computed({
  get: () => categories.value.filter((c) => !c.parentId).sort((a, b) => a.order - b.order),
  set: (newList) => {
    newList.forEach((item, index) => {
      const cat = categories.value.find((c) => c.id === item.id)
      if (cat) cat.order = index + 1
    })
  },
})

// 대분류 목록 (parent_id가 null인 것들)
const parentCategories = computed(() => {
  return categories.value
    .filter((c) => !c.parentId)
    .sort((a, b) => a.order - b.order)
})

// 특정 대분류의 드래그 가능 소분류 목록
const getDraggableChildren = (parentId) => {
  return computed({
    get: () => categories.value.filter((c) => c.parentId === parentId).sort((a, b) => a.order - b.order),
    set: (newList) => {
      newList.forEach((item, index) => {
        const cat = categories.value.find((c) => c.id === item.id)
        if (cat) cat.order = index + 1
      })
    },
  })
}

// 특정 대분류의 소분류 목록
const getChildCategories = (parentId) => {
  return categories.value
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.order - b.order)
}

// 현재 데이터를 JSON 문자열로 생성 (변경 감지용)
const getCurrentDataString = () => {
  const sorted = [...categories.value].sort((a, b) => a.id - b.id)
  return JSON.stringify(sorted)
}

// 변경 여부 (추가/수정/삭제/순서변경 모두 감지)
const hasChanges = computed(() => {
  return originalData.value !== getCurrentDataString()
})

// 소분류 존재 여부
const hasChildren = (parentId) => {
  return categories.value.some((c) => c.parentId === parentId)
}

// 데이터 로드
const fetchCategories = async () => {
  isLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 300))

  // ============================================
  // 백엔드에서 넘어오는 데이터 구조 (Flat Array)
  // GET /api/categories 응답 예시
  // ============================================
  const apiResponse = [
    // 대분류 (parent_id = null)
    { id: 1, name: '의류', parent_id: null, order: 1, created_at: '2025-01-01T00:00:00Z' },
    { id: 5, name: '신발', parent_id: null, order: 2, created_at: '2025-01-01T00:00:00Z' },
    { id: 9, name: '가방', parent_id: null, order: 3, created_at: '2025-01-01T00:00:00Z' },
    { id: 12, name: '액세서리', parent_id: null, order: 4, created_at: '2025-01-01T00:00:00Z' },

    // 소분류 (parent_id = 대분류 id)
    { id: 2, name: '상의', parent_id: 1, order: 1, created_at: '2025-01-01T00:00:00Z' },
    { id: 3, name: '하의', parent_id: 1, order: 2, created_at: '2025-01-01T00:00:00Z' },
    { id: 4, name: '아우터', parent_id: 1, order: 3, created_at: '2025-01-01T00:00:00Z' },
    { id: 6, name: '운동화', parent_id: 5, order: 1, created_at: '2025-01-01T00:00:00Z' },
    { id: 7, name: '구두', parent_id: 5, order: 2, created_at: '2025-01-01T00:00:00Z' },
    { id: 8, name: '샌들', parent_id: 5, order: 3, created_at: '2025-01-01T00:00:00Z' },
    { id: 10, name: '백팩', parent_id: 9, order: 1, created_at: '2025-01-01T00:00:00Z' },
    { id: 11, name: '숄더백', parent_id: 9, order: 2, created_at: '2025-01-01T00:00:00Z' },
    { id: 13, name: '모자', parent_id: 12, order: 1, created_at: '2025-01-01T00:00:00Z' },
    { id: 14, name: '벨트', parent_id: 12, order: 2, created_at: '2025-01-01T00:00:00Z' },
  ]

  console.log('========================================')
  console.log('📦 백엔드 API 응답 (GET /api/categories)')
  console.log('========================================')
  console.table(apiResponse)

  console.log('\n📊 데이터 구조 요약:')
  console.log('- 대분류 (parent_id = null):', apiResponse.filter(c => c.parent_id === null).length, '개')
  console.log('- 소분류 (parent_id ≠ null):', apiResponse.filter(c => c.parent_id !== null).length, '개')
  console.log('- 총:', apiResponse.length, '개')

  // snake_case → camelCase 변환 (프론트엔드 컨벤션)
  categories.value = apiResponse.map((c) => ({
    id: c.id,
    name: c.name,
    parentId: c.parent_id,
    order: c.order,
  }))

  // 원본 데이터 저장
  originalData.value = getCurrentDataString()

  isLoading.value = false
}

// 모든 변경사항 저장
const saveAllChanges = async () => {
  isSaving.value = true

  // API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 백엔드로 보낼 데이터 구조
  const saveData = categories.value.map((c) => ({
    id: c.id,
    name: c.name,
    parent_id: c.parentId,
    order: c.order,
  }))

  console.log('========================================')
  console.log('📤 카테고리 저장 API 요청 (PUT /api/categories)')
  console.log('========================================')
  console.table(saveData)

  // 원본 데이터 업데이트
  originalData.value = getCurrentDataString()

  isSaving.value = false
  uiStore.showToast({ type: 'success', message: '카테고리가 저장되었습니다.' })
}

// 변경 취소 (원본 데이터로 복원)
const cancelChanges = () => {
  fetchCategories()
}

// 대분류 추가
const addParentCategory = () => {
  const name = newParentName.value.trim()
  if (!name) {
    uiStore.showToast({ type: 'error', message: '카테고리 이름을 입력해주세요.' })
    return
  }

  const newId = Date.now()
  const maxOrder = Math.max(0, ...parentCategories.value.map((c) => c.order))

  categories.value.push({
    id: newId,
    name,
    parentId: null,
    order: maxOrder + 1,
  })

  newParentName.value = ''
}

// 소분류 추가
const addChildCategory = (parentId) => {
  const name = (newChildNames.value[parentId] || '').trim()
  if (!name) {
    uiStore.showToast({ type: 'error', message: '카테고리 이름을 입력해주세요.' })
    return
  }

  const siblings = getChildCategories(parentId)
  const maxOrder = Math.max(0, ...siblings.map((c) => c.order))

  const newId = Date.now()
  categories.value.push({
    id: newId,
    name,
    parentId,
    order: maxOrder + 1,
  })

  newChildNames.value[parentId] = ''
}

// 수정 모드 시작
const startEdit = (category) => {
  editingId.value = category.id
  editingName.value = category.name
}

// 수정 취소
const cancelEdit = () => {
  editingId.value = null
  editingName.value = ''
}

// 수정 저장
const saveEdit = () => {
  const name = editingName.value.trim()
  if (!name) {
    uiStore.showToast({ type: 'error', message: '카테고리 이름을 입력해주세요.' })
    return
  }

  const category = categories.value.find((c) => c.id === editingId.value)
  if (category) {
    category.name = name
  }

  cancelEdit()
}

// 삭제 확인
const confirmDelete = (category) => {
  deleteTarget.value = category
  showDeleteModal.value = true
}

// 삭제 실행
const executeDelete = () => {
  if (!deleteTarget.value) return

  const targetId = deleteTarget.value.id
  const isParent = !deleteTarget.value.parentId

  // 대분류면 소분류도 함께 삭제
  if (isParent) {
    categories.value = categories.value.filter(
      (c) => c.id !== targetId && c.parentId !== targetId
    )
  } else {
    categories.value = categories.value.filter((c) => c.id !== targetId)
  }

  showDeleteModal.value = false
  deleteTarget.value = null
}

// 초기 로드
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <LayoutFormPage
    title="카테고리 관리"
    description="상품 카테고리를 추가하고 관리합니다. 드래그하여 순서를 변경할 수 있습니다."
    :is-saving="isSaving"
    :save-disabled="!hasChanges"
    show-cancel
    @save="saveAllChanges"
    @cancel="cancelChanges"
  >
    <!-- 로딩 -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <div v-else class="max-w-2xl">
      <!-- 대분류 추가 -->
      <div class="mb-6">
        <div class="flex gap-2">
          <input
            v-model="newParentName"
            type="text"
            class="flex-1 px-4 py-3 border border-neutral-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="새 대분류 이름을 입력하세요"
            @keyup.enter="addParentCategory"
          >
          <button
            type="button"
            class="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            @click="addParentCategory"
          >
            추가
          </button>
        </div>
      </div>

      <!-- 카테고리 목록 (드래그앤드롭) -->
      <draggable
        v-model="draggableParents"
        item-key="id"
        handle=".parent-drag-handle"
        ghost-class="opacity-50"
        class="space-y-4"
      >
        <template #item="{ element: parent }">
          <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <!-- 대분류 헤더 -->
            <div class="flex items-center gap-3 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
              <!-- 드래그 핸들 -->
              <button
                type="button"
                class="parent-drag-handle p-1 cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600"
                title="드래그하여 순서 변경"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </button>

              <svg class="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>

            <!-- 수정 모드 -->
            <template v-if="editingId === parent.id">
              <input
                v-model="editingName"
                type="text"
                class="flex-1 px-3 py-1.5 border border-primary-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit"
              >
              <button
                type="button"
                class="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                @click="saveEdit"
              >
                저장
              </button>
              <button
                type="button"
                class="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900"
                @click="cancelEdit"
              >
                취소
              </button>
            </template>

            <!-- 보기 모드 -->
            <template v-else>
              <span class="flex-1 font-medium text-neutral-900">{{ parent.name }}</span>
              <button
                type="button"
                class="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                title="수정"
                @click="startEdit(parent)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                type="button"
                class="p-2 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                title="삭제"
                @click="confirmDelete(parent)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </template>
          </div>

          <!-- 소분류 영역 -->
          <div class="p-4">
            <!-- 소분류 추가 -->
            <div class="flex gap-2 mb-3">
              <input
                v-model="newChildNames[parent.id]"
                type="text"
                class="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="소분류 이름 입력"
                @keyup.enter="addChildCategory(parent.id)"
              >
              <button
                type="button"
                class="px-4 py-2 text-sm bg-neutral-100 text-neutral-700 font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                @click="addChildCategory(parent.id)"
              >
                추가
              </button>
            </div>

            <!-- 소분류 목록 (드래그앤드롭) -->
            <draggable
              v-if="hasChildren(parent.id)"
              v-model="getDraggableChildren(parent.id).value"
              item-key="id"
              handle=".child-drag-handle"
              ghost-class="opacity-50"
              class="space-y-1"
            >
              <template #item="{ element: child }">
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-50 group">
                  <!-- 드래그 핸들 -->
                  <button
                    type="button"
                    class="child-drag-handle p-0.5 cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500"
                    title="드래그하여 순서 변경"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </button>

                  <span class="w-4 text-neutral-300">└</span>

                  <!-- 수정 모드 -->
                  <template v-if="editingId === child.id">
                    <input
                      v-model="editingName"
                      type="text"
                      class="flex-1 px-2 py-1 border border-primary-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      @keyup.enter="saveEdit"
                      @keyup.escape="cancelEdit"
                    >
                    <button
                      type="button"
                      class="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600"
                      @click="saveEdit"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      class="px-2 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                      @click="cancelEdit"
                    >
                      취소
                    </button>
                  </template>

                  <!-- 보기 모드 -->
                  <template v-else>
                    <span class="flex-1 text-sm text-neutral-700">{{ child.name }}</span>
                    <button
                      type="button"
                      class="p-1.5 text-neutral-300 hover:text-primary-500 hover:bg-primary-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="수정"
                      @click="startEdit(child)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="p-1.5 text-neutral-300 hover:text-error-500 hover:bg-error-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="삭제"
                      @click="confirmDelete(child)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </template>
                </div>
              </template>
            </draggable>

            <!-- 소분류 없음 -->
            <p v-if="!hasChildren(parent.id)" class="text-sm text-neutral-400 text-center py-2">
              소분류가 없습니다
            </p>
          </div>
        </div>
        </template>
      </draggable>

      <!-- 카테고리 없음 -->
      <div v-if="parentCategories.length === 0" class="text-center py-12 bg-white border border-neutral-200 rounded-xl">
        <svg class="w-12 h-12 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-neutral-500">등록된 카테고리가 없습니다</p>
        <p class="text-sm text-neutral-400 mt-1">위 입력창에서 대분류를 추가해보세요</p>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <UiModal
      v-model="showDeleteModal"
      title="카테고리 삭제"
      size="sm"
    >
      <div class="text-center py-4">
        <div class="w-12 h-12 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-neutral-900 font-medium mb-2">
          "{{ deleteTarget?.name }}"을(를) 삭제하시겠습니까?
        </p>
        <p v-if="deleteTarget && !deleteTarget.parentId && hasChildren(deleteTarget.id)" class="text-sm text-error-600">
          하위 소분류도 함께 삭제됩니다.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-center gap-3">
          <UiButton variant="outline" @click="showDeleteModal = false">
            취소
          </UiButton>
          <UiButton variant="error" @click="executeDelete">
            삭제
          </UiButton>
        </div>
      </template>
    </UiModal>
  </LayoutFormPage>
</template>
