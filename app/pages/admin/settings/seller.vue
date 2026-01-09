<script setup>
/**
 * 판매자 정보 설정 페이지
 * - 사업자 정보
 * - 대표자 정보
 * - 고객센터 정보
 * - 계좌 정보
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 로딩/저장 상태
const isLoading = ref(true)
const isSaving = ref(false)

// 판매자 정보
const sellerInfo = ref({
  // 사업자 정보
  businessName: '',
  businessNumber: '',
  businessType: '',
  businessCategory: '',
  mailOrderNumber: '',

  // 대표자 정보
  ceoName: '',
  ceoPhone: '',
  ceoEmail: '',

  // 사업장 주소
  zipcode: '',
  address1: '',
  address2: '',

  // 고객센터 정보
  csPhone: '',
  csFax: '',
  csEmail: '',
  csHours: '',

  // 계좌 정보
  bankName: '',
  bankAccount: '',
  bankHolder: '',
})

// Mock 데이터 로드
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  sellerInfo.value = {
    businessName: '(주)테스트컴퍼니',
    businessNumber: '123-45-67890',
    businessType: '법인',
    businessCategory: '전자상거래 / 의류도소매',
    mailOrderNumber: '제2024-서울강남-12345호',

    ceoName: '홍길동',
    ceoPhone: '010-1234-5678',
    ceoEmail: 'ceo@example.com',

    zipcode: '06234',
    address1: '서울시 강남구 테헤란로 123',
    address2: '테스트빌딩 10층',

    csPhone: '1588-1234',
    csFax: '02-1234-5679',
    csEmail: 'cs@example.com',
    csHours: '평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)',

    bankName: '신한은행',
    bankAccount: '110-123-456789',
    bankHolder: '(주)테스트컴퍼니',
  }

  isLoading.value = false
})

// 저장
const handleSave = async () => {
  isSaving.value = true

  // 실제로는 API 호출
  await new Promise((resolve) => setTimeout(resolve, 1000))

  isSaving.value = false

  uiStore.showToast({
    type: 'success',
    message: '판매자 정보가 저장되었습니다.',
  })
}
</script>

<template>
  <LayoutFormPage
    title="판매자 정보"
    description="쇼핑몰에 표시되는 판매자 정보를 관리합니다."
    :is-saving="isSaving"
    @save="handleSave"
  >
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- 사업자 정보 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">사업자 정보</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              상호명 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="sellerInfo.businessName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="상호명을 입력하세요"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              사업자등록번호 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="sellerInfo.businessNumber"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="000-00-00000"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              사업자 구분
            </label>
            <select
              v-model="sellerInfo.businessType"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">선택하세요</option>
              <option value="개인">개인</option>
              <option value="법인">법인</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              업태/업종
            </label>
            <input
              v-model="sellerInfo.businessCategory"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="업태 / 업종"
            >
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              통신판매업신고번호
            </label>
            <input
              v-model="sellerInfo.mailOrderNumber"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="제0000-지역-00000호"
            >
          </div>
        </div>
      </UiCard>

      <!-- 대표자 정보 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">대표자 정보</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              대표자명 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="sellerInfo.ceoName"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="대표자명"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              대표 연락처
            </label>
            <input
              v-model="sellerInfo.ceoPhone"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="010-0000-0000"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              대표 이메일
            </label>
            <input
              v-model="sellerInfo.ceoEmail"
              type="email"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="email@example.com"
            >
          </div>
        </div>
      </UiCard>

      <!-- 사업장 주소 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">사업장 주소</h3>
        </template>
        <div class="space-y-4">
          <div class="flex gap-2">
            <input
              v-model="sellerInfo.zipcode"
              type="text"
              class="w-32 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="우편번호"
              readonly
            >
            <UiButton variant="outline" size="sm">주소 검색</UiButton>
          </div>
          <div>
            <input
              v-model="sellerInfo.address1"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="기본 주소"
              readonly
            >
          </div>
          <div>
            <input
              v-model="sellerInfo.address2"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="상세 주소를 입력하세요"
            >
          </div>
        </div>
      </UiCard>

      <!-- 고객센터 정보 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">고객센터 정보</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              고객센터 전화번호 <span class="text-error-500">*</span>
            </label>
            <input
              v-model="sellerInfo.csPhone"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="1588-0000"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              팩스번호
            </label>
            <input
              v-model="sellerInfo.csFax"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="02-0000-0000"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              고객센터 이메일
            </label>
            <input
              v-model="sellerInfo.csEmail"
              type="email"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="cs@example.com"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              운영시간
            </label>
            <input
              v-model="sellerInfo.csHours"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="평일 09:00 ~ 18:00"
            >
          </div>
        </div>
      </UiCard>

      <!-- 정산 계좌 정보 -->
      <UiCard>
        <template #header>
          <h3 class="font-semibold text-neutral-900">정산 계좌 정보</h3>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              은행명
            </label>
            <select
              v-model="sellerInfo.bankName"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">선택하세요</option>
              <option value="신한은행">신한은행</option>
              <option value="국민은행">국민은행</option>
              <option value="우리은행">우리은행</option>
              <option value="하나은행">하나은행</option>
              <option value="기업은행">기업은행</option>
              <option value="농협은행">농협은행</option>
              <option value="카카오뱅크">카카오뱅크</option>
              <option value="토스뱅크">토스뱅크</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              계좌번호
            </label>
            <input
              v-model="sellerInfo.bankAccount"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="계좌번호 입력"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              예금주
            </label>
            <input
              v-model="sellerInfo.bankHolder"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="예금주명"
            >
          </div>
        </div>
      </UiCard>
    </div>
  </LayoutFormPage>
</template>
