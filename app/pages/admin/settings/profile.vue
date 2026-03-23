<script setup>
/**
 * 관리자 프로필 / 비밀번호 변경 페이지
 * - PATCH /users/me : 프로필 수정
 * - PATCH /users/me/password : 비밀번호 변경
 */

import { useUiStore } from '~/stores/ui'
import { useAuthStore } from '~/stores/auth'

const { $api } = useNuxtApp()
const uiStore = useUiStore()
const authStore = useAuthStore()

// 탭
const activeTab = ref('profile')
const tabs = [
  { id: 'profile', label: '내 정보' },
  { id: 'password', label: '비밀번호 변경' },
]

// ── 프로필 수정 ──
const isSavingProfile = ref(false)
const profileForm = ref({
  name: '',
  phone: '',
})

// 초기값 로드
const initProfileForm = () => {
  const user = authStore.user
  if (user) {
    profileForm.value = {
      name: user.name || '',
      phone: user.phone || '',
    }
  }
}

const handleSaveProfile = async () => {
  if (!profileForm.value.name.trim()) {
    uiStore.showToast({ type: 'error', message: '이름을 입력해주세요.' })
    return
  }

  isSavingProfile.value = true
  try {
    await $api.patch('/users/me', {
      name: profileForm.value.name.trim(),
      phone: profileForm.value.phone.trim() || undefined,
    })

    uiStore.showToast({ type: 'success', message: '프로필이 수정되었습니다.' })

    // auth store 유저 정보 갱신
    await authStore.fetchUser()
    initProfileForm()
  } catch (err) {
    uiStore.showToast({
      type: 'error',
      message: err.data?.message || '프로필 수정에 실패했습니다.',
    })
  } finally {
    isSavingProfile.value = false
  }
}

// ── 비밀번호 변경 ──
const isSavingPassword = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordError = ref('')

const handleChangePassword = async () => {
  passwordError.value = ''

  if (!passwordForm.value.currentPassword) {
    passwordError.value = '현재 비밀번호를 입력해주세요.'
    return
  }
  if (!passwordForm.value.newPassword) {
    passwordError.value = '새 비밀번호를 입력해주세요.'
    return
  }
  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = '새 비밀번호는 8자 이상이어야 합니다.'
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '새 비밀번호가 일치하지 않습니다.'
    return
  }

  isSavingPassword.value = true
  try {
    await $api.patch('/users/me/password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    uiStore.showToast({ type: 'success', message: '비밀번호가 변경되었습니다.' })

    // 폼 초기화
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    const msg = err.data?.message || '비밀번호 변경에 실패했습니다.'
    passwordError.value = msg
  } finally {
    isSavingPassword.value = false
  }
}

onMounted(() => {
  initProfileForm()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-neutral-900">내 계정</h1>
      <p class="mt-1 text-neutral-600">프로필 정보와 비밀번호를 관리합니다.</p>
    </div>

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

    <!-- 프로필 탭 -->
    <div v-if="activeTab === 'profile'">
      <UiCard class="max-w-lg">
        <template #header>
          <h3 class="font-semibold text-neutral-900">내 정보 수정</h3>
        </template>

        <div class="space-y-4">
          <!-- 이메일 (읽기 전용) -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
            <input
              :value="authStore.user?.email || ''"
              type="text"
              disabled
              class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500"
            >
          </div>

          <!-- 이름 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              이름 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="profileForm.name"
              type="text"
              placeholder="이름"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
          </div>

          <!-- 연락처 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">연락처</label>
            <input
              v-model="profileForm.phone"
              type="text"
              placeholder="010-0000-0000"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <UiButton
            variant="primary"
            :loading="isSavingProfile"
            @click="handleSaveProfile"
          >
            저장
          </UiButton>
        </div>
      </UiCard>
    </div>

    <!-- 비밀번호 탭 -->
    <div v-if="activeTab === 'password'">
      <UiCard class="max-w-lg">
        <template #header>
          <h3 class="font-semibold text-neutral-900">비밀번호 변경</h3>
        </template>

        <div class="space-y-4">
          <!-- 에러 메시지 -->
          <div v-if="passwordError" class="p-3 bg-error-50 border border-error-200 rounded-lg">
            <p class="text-sm text-error-700">{{ passwordError }}</p>
          </div>

          <!-- 현재 비밀번호 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              현재 비밀번호 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="현재 비밀번호"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
          </div>

          <!-- 새 비밀번호 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              새 비밀번호 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="8자 이상"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
          </div>

          <!-- 새 비밀번호 확인 -->
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              새 비밀번호 확인 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="새 비밀번호 재입력"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              @keyup.enter="handleChangePassword"
            >
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <UiButton
            variant="primary"
            :loading="isSavingPassword"
            @click="handleChangePassword"
          >
            비밀번호 변경
          </UiButton>
        </div>
      </UiCard>
    </div>
  </div>
</template>
