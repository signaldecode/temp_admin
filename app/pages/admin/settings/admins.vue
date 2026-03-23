<script setup>
/**
 * 관리자 계정 관리 페이지
 * - 관리자 목록 조회 (GET API 추가 시 연동)
 * - 관리자 상태 변경 (ACTIVE / INACTIVE / SUSPENDED)
 */

import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

const { $api } = useNuxtApp()
const uiStore = useUiStore()
const authStore = useAuthStore()

// 현재 로그인한 관리자
const currentAdmin = computed(() => authStore.user)

// 로딩 상태
const isLoading = ref(false)

// 관리자 목록
const admins = ref([])

// 관리자 목록 조회
const fetchAdmins = async () => {
  isLoading.value = true
  try {
    // TODO: GET /admin/admins API가 추가되면 연동
    // const response = await $api.get('/admin/admins')
    // admins.value = response.data?.content || []

    // 현재는 API 미제공 — 빈 목록
    admins.value = []
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '관리자 목록을 불러오는데 실패했습니다.',
    })
  } finally {
    isLoading.value = false
  }
}

// 상태 변경 모달
const showStatusModal = ref(false)
const targetAdmin = ref(null)
const newStatus = ref('')
const statusReason = ref('')
const isChangingStatus = ref(false)

const statusOptions = [
  { value: 'ACTIVE', label: '활성', variant: 'success', description: '정상적으로 로그인 및 관리 기능 사용 가능' },
  { value: 'INACTIVE', label: '비활성', variant: 'warning', description: '로그인 불가, 계정 일시 중지' },
  { value: 'SUSPENDED', label: '정지', variant: 'error', description: '로그인 불가, 계정 정지' },
]

const statusMap = {
  ACTIVE: { label: '활성', variant: 'success' },
  INACTIVE: { label: '비활성', variant: 'warning' },
  SUSPENDED: { label: '정지', variant: 'error' },
}

const roleMap = {
  SUPER_ADMIN: '최고 관리자',
  ADMIN: '관리자',
  STAFF: '스태프',
}

// 상태 변경 모달 열기
const openStatusModal = (admin) => {
  if (admin.id === currentAdmin.value?.id) {
    uiStore.showToast({ type: 'error', message: '자기 자신의 상태는 변경할 수 없습니다.' })
    return
  }
  targetAdmin.value = admin
  newStatus.value = admin.status
  statusReason.value = ''
  showStatusModal.value = true
}

// 상태 변경 실행
const handleStatusChange = async () => {
  if (!targetAdmin.value || !newStatus.value) return
  if (newStatus.value === targetAdmin.value.status) {
    showStatusModal.value = false
    return
  }

  isChangingStatus.value = true
  try {
    await $api.patch(`/admin/admins/${targetAdmin.value.id}/status`, {
      status: newStatus.value,
      reason: statusReason.value.trim() || undefined,
    })

    // 로컬 상태 업데이트
    const index = admins.value.findIndex((a) => a.id === targetAdmin.value.id)
    if (index > -1) {
      admins.value[index].status = newStatus.value
    }

    showStatusModal.value = false
    uiStore.showToast({
      type: 'success',
      message: `${targetAdmin.value.name || targetAdmin.value.email}의 상태가 변경되었습니다.`,
    })
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '상태 변경에 실패했습니다.',
    })
  } finally {
    isChangingStatus.value = false
  }
}

onMounted(() => {
  fetchAdmins()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">관리자 계정</h1>
        <p class="mt-1 text-neutral-600">관리자 계정의 상태를 관리합니다.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- 관리자 목록 -->
    <template v-else>
      <!-- API 미연동 안내 -->
      <div v-if="admins.length === 0" class="space-y-4">
        <div class="p-4 bg-info-50 border border-info-200 rounded-lg">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-info-700">관리자 목록 조회 API 연동 대기</p>
              <p class="text-sm text-info-600 mt-1">
                관리자 목록 조회 API(GET /admin/admins)가 백엔드에 추가되면 자동으로 연동됩니다.
                현재는 관리자 상태 변경 API만 사용 가능합니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 현재 로그인한 관리자 정보 -->
        <UiCard v-if="currentAdmin">
          <template #header>
            <h3 class="font-semibold text-neutral-900">내 관리자 정보</h3>
          </template>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {{ currentAdmin.name?.charAt(0) || '?' }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-neutral-900">{{ currentAdmin.name || '-' }}</p>
              <p class="text-sm text-neutral-600">{{ currentAdmin.email }}</p>
            </div>
            <UiBadge variant="success" dot>활성</UiBadge>
          </div>
        </UiCard>
      </div>

      <!-- 관리자 목록 (API 연동 후 활성화) -->
      <div v-else class="space-y-3">
        <UiCard
          v-for="admin in admins"
          :key="admin.id"
          class="hover:border-neutral-300 transition-colors"
        >
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <!-- Avatar + Info -->
            <div class="flex items-center gap-3 flex-1">
              <div class="w-10 h-10 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {{ admin.name?.charAt(0) || '?' }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-neutral-900 truncate">{{ admin.name || '-' }}</p>
                  <UiBadge v-if="admin.id === currentAdmin?.id" variant="primary" size="sm">나</UiBadge>
                </div>
                <p class="text-sm text-neutral-500 truncate">{{ admin.email }}</p>
              </div>
            </div>

            <!-- Role -->
            <div class="text-sm text-neutral-600">
              {{ roleMap[admin.role] || admin.role }}
            </div>

            <!-- Status + Action -->
            <div class="flex items-center gap-3">
              <UiBadge :variant="statusMap[admin.status]?.variant || 'neutral'" dot>
                {{ statusMap[admin.status]?.label || admin.status }}
              </UiBadge>
              <button
                v-if="admin.id !== currentAdmin?.id"
                type="button"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
                @click="openStatusModal(admin)"
              >
                상태 변경
              </button>
            </div>
          </div>
        </UiCard>
      </div>
    </template>

    <!-- 상태 변경 모달 -->
    <UiModal
      v-model="showStatusModal"
      title="관리자 상태 변경"
      size="sm"
    >
      <div v-if="targetAdmin" class="space-y-4">
        <!-- 대상 관리자 정보 -->
        <div class="p-3 bg-neutral-50 rounded-lg">
          <p class="text-sm text-neutral-500">대상 관리자</p>
          <p class="font-medium text-neutral-900">{{ targetAdmin.name || targetAdmin.email }}</p>
        </div>

        <!-- 상태 선택 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">변경할 상태</label>
          <div class="space-y-2">
            <label
              v-for="option in statusOptions"
              :key="option.value"
              :class="[
                'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
                newStatus === option.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-neutral-300',
              ]"
            >
              <input
                v-model="newStatus"
                type="radio"
                :value="option.value"
                class="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500"
              >
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-neutral-900">{{ option.label }}</span>
                  <UiBadge :variant="option.variant" size="sm" dot>{{ option.label }}</UiBadge>
                </div>
                <p class="text-xs text-neutral-500 mt-0.5">{{ option.description }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- 사유 -->
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">사유 (선택)</label>
          <textarea
            v-model="statusReason"
            rows="2"
            placeholder="상태 변경 사유"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" :disabled="isChangingStatus" @click="showStatusModal = false">
            취소
          </UiButton>
          <UiButton
            variant="primary"
            :loading="isChangingStatus"
            :disabled="!newStatus || newStatus === targetAdmin?.status"
            @click="handleStatusChange"
          >
            변경
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
