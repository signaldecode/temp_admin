<script setup>
/**
 * 관리자 회원가입 페이지
 * - POST /auth/email-verifications : 인증 코드 발송
 * - PATCH /auth/email-verifications : 인증 코드 확인
 * - POST /auth/signup : 회원가입 완료
 */

definePageMeta({
  layout: 'auth',
})

const { $api } = useNuxtApp()
const router = useRouter()

// 단계: email → verify → info
const step = ref('email')

// 폼 데이터
const form = reactive({
  email: '',
  code: '',
  verificationToken: '',
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 1단계: 이메일 인증 코드 발송
const handleSendCode = async () => {
  errorMessage.value = ''
  if (!form.email) {
    errorMessage.value = '이메일을 입력해주세요.'
    return
  }

  isLoading.value = true
  try {
    await $api.post('/auth/email-verifications', {
      email: form.email,
    })
    step.value = 'verify'
    successMessage.value = '인증 코드가 이메일로 발송되었습니다.'
  } catch (err) {
    errorMessage.value = err.data?.message || '인증 코드 발송에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 2단계: 인증 코드 확인
const handleVerifyCode = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  if (!form.code) {
    errorMessage.value = '인증 코드를 입력해주세요.'
    return
  }

  isLoading.value = true
  try {
    const response = await $api.patch('/auth/email-verifications', {
      email: form.email,
      code: form.code,
    })
    const data = response.data || response
    form.verificationToken = data.verificationToken || data.verification_token || ''
    step.value = 'info'
    successMessage.value = '이메일 인증이 완료되었습니다.'
  } catch (err) {
    errorMessage.value = err.data?.message || '인증 코드가 올바르지 않습니다.'
  } finally {
    isLoading.value = false
  }
}

// 3단계: 회원가입 완료
const handleSignup = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.name.trim()) {
    errorMessage.value = '이름을 입력해주세요.'
    return
  }
  if (!form.phone.trim()) {
    errorMessage.value = '연락처를 입력해주세요.'
    return
  }
  if (!form.password || form.password.length < 8) {
    errorMessage.value = '비밀번호는 8자 이상이어야 합니다.'
    return
  }
  if (form.password !== form.confirmPassword) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  isLoading.value = true
  try {
    await $api.post('/auth/signup', {
      email: form.email,
      password: form.password,
      name: form.name.trim(),
      phone: form.phone.trim(),
      verificationToken: form.verificationToken,
    })

    successMessage.value = '회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.'
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    errorMessage.value = err.data?.message || '회원가입에 실패했습니다.'
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
      <p class="mt-2 text-neutral-600">관리자 계정 등록</p>
    </div>

    <UiCard padding="lg">
      <!-- 에러/성공 메시지 -->
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

      <!-- 단계 표시 -->
      <div class="flex items-center gap-2 mb-6">
        <div v-for="(s, i) in ['이메일 인증', '코드 확인', '정보 입력']" :key="s" class="flex items-center gap-2">
          <span
            :class="[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
              (step === 'email' && i === 0) || (step === 'verify' && i === 1) || (step === 'info' && i === 2)
                ? 'bg-primary-600 text-white'
                : i < ['email', 'verify', 'info'].indexOf(step)
                  ? 'bg-success-100 text-success-700'
                  : 'bg-neutral-100 text-neutral-400',
            ]"
          >
            {{ i + 1 }}
          </span>
          <span class="text-xs text-neutral-500 hidden sm:inline">{{ s }}</span>
          <svg v-if="i < 2" class="w-4 h-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- 1단계: 이메일 -->
      <form v-if="step === 'email'" @submit.prevent="handleSendCode">
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
          인증 코드 발송
        </UiButton>
      </form>

      <!-- 2단계: 인증 코드 -->
      <form v-if="step === 'verify'" @submit.prevent="handleVerifyCode">
        <div class="mb-2">
          <label class="block text-sm font-medium text-neutral-700 mb-1">이메일</label>
          <input
            :value="form.email"
            type="text"
            disabled
            class="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 text-neutral-500"
          >
        </div>
        <div class="mb-4">
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
        <div class="flex gap-2">
          <UiButton variant="outline" size="lg" class="flex-1" @click="handleSendCode" :loading="isLoading">
            재발송
          </UiButton>
          <UiButton type="submit" variant="primary" size="lg" class="flex-1" :loading="isLoading">
            확인
          </UiButton>
        </div>
      </form>

      <!-- 3단계: 정보 입력 -->
      <form v-if="step === 'info'" @submit.prevent="handleSignup" class="space-y-4">
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
          <label class="block text-sm font-medium text-neutral-700 mb-1">이름 <span class="text-error-500">*</span></label>
          <input
            v-model="form.name"
            type="text"
            placeholder="이름"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">연락처 <span class="text-error-500">*</span></label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="010-0000-0000"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">비밀번호 <span class="text-error-500">*</span></label>
          <input
            v-model="form.password"
            type="password"
            placeholder="8자 이상"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-1">비밀번호 확인 <span class="text-error-500">*</span></label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="비밀번호 재입력"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
        </div>
        <UiButton type="submit" variant="primary" size="lg" block :loading="isLoading">
          가입하기
        </UiButton>
      </form>
    </UiCard>

    <!-- Footer -->
    <p class="mt-6 text-center text-sm text-neutral-500">
      이미 계정이 있으신가요?
      <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
        로그인
      </NuxtLink>
    </p>
  </div>
</template>
