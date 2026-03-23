<script setup>
/**
 * 비밀번호 찾기 페이지
 * - POST /auth/password-reset/send : 재설정 코드 발송
 * - PATCH /auth/password-reset : 비밀번호 재설정
 */

definePageMeta({
  layout: 'auth',
})

const { $api } = useNuxtApp()
const router = useRouter()

// 단계: email → reset
const step = ref('email')

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 1단계: 재설정 코드 발송
const handleSendCode = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!form.email) {
    errorMessage.value = '이메일을 입력해주세요.'
    return
  }

  isLoading.value = true
  try {
    await $api.post('/auth/password-reset/send', {
      email: form.email,
    })
    step.value = 'reset'
    successMessage.value = '비밀번호 재설정 코드가 이메일로 발송되었습니다.'
  } catch (err) {
    errorMessage.value = err.data?.message || '코드 발송에 실패했습니다. 이메일을 확인해주세요.'
  } finally {
    isLoading.value = false
  }
}

// 2단계: 비밀번호 재설정
const handleReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.code) {
    errorMessage.value = '인증 코드를 입력해주세요.'
    return
  }
  if (!form.newPassword || form.newPassword.length < 8) {
    errorMessage.value = '새 비밀번호는 8자 이상이어야 합니다.'
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  isLoading.value = true
  try {
    await $api.patch('/auth/password-reset', {
      email: form.email,
      code: form.code,
      newPassword: form.newPassword,
    })
    successMessage.value = '비밀번호가 재설정되었습니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    errorMessage.value = err.data?.message || '비밀번호 재설정에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Title -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-primary-700">Admin</h1>
      <p class="mt-2 text-neutral-600">비밀번호 찾기</p>
    </div>

    <UiCard padding="lg">
      <!-- 메시지 -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg text-sm text-error-700"
      >
        {{ errorMessage }}
      </div>
      <div
        v-if="successMessage"
        class="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg text-sm text-success-700"
      >
        {{ successMessage }}
      </div>

      <!-- 1단계: 이메일 입력 -->
      <form v-if="step === 'email'" @submit.prevent="handleSendCode">
        <p class="text-sm text-neutral-600 mb-4">
          가입한 이메일 주소를 입력하면 비밀번호 재설정 코드를 보내드립니다.
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <UiButton type="submit" variant="primary" size="lg" block :loading="isLoading">
          재설정 코드 발송
        </UiButton>
      </form>

      <!-- 2단계: 코드 + 새 비밀번호 -->
      <form v-if="step === 'reset'" @submit.prevent="handleReset" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
          <input
            :value="form.email"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">인증 코드 (6자리)</label>
          <input
            v-model="form.code"
            type="text"
            maxlength="6"
            placeholder="000000"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">새 비밀번호</label>
          <input
            v-model="form.newPassword"
            type="password"
            placeholder="8자 이상"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">새 비밀번호 확인</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="비밀번호 재입력"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <div class="flex gap-2">
          <UiButton variant="outline" size="lg" class="flex-1" @click="handleSendCode" :loading="isLoading">
            코드 재발송
          </UiButton>
          <UiButton type="submit" variant="primary" size="lg" class="flex-1" :loading="isLoading">
            비밀번호 변경
          </UiButton>
        </div>
      </form>
    </UiCard>

    <!-- Footer -->
    <p class="mt-6 text-center text-sm text-neutral-500">
      <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
        로그인으로 돌아가기
      </NuxtLink>
    </p>
  </div>
</template>
