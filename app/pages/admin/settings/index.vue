<script setup>
/**
 * 기본 설정 페이지
 * - 쇼핑몰 정보 (푸터 정보 포함)
 * - 정산 정보
 * - 운영 상태
 * - SEO 설정
 * - 소셜 미디어
 * - 알림 설정
 * - 보안 설정
 */

import { useUiStore } from '~/stores/ui'

const uiStore = useUiStore()

// 탭 정의
const tabs = [
  { id: 'shop', label: '쇼핑몰 정보' },
  { id: 'settlement', label: '정산 정보' },
  { id: 'operation', label: '운영 상태' },
  { id: 'seo', label: 'SEO 설정' },
  { id: 'social', label: '소셜 미디어' },
  { id: 'notification', label: '알림 설정' },
  { id: 'security', label: '보안 설정' },
]

const activeTab = ref('shop')

// 로딩/저장 상태
const isLoading = ref(true)
const isSaving = ref(false)

// 쇼핑몰 정보 (푸터 정보 포함)
const shopInfo = ref({
  // 기본 정보
  shopName: '',
  shopNameEn: '',
  logoUrl: '',
  faviconUrl: '',
  shopUrl: '',

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

  // 개인정보 관리
  privacyManager: '',
  privacyEmail: '',

  // 저작권
  copyright: '',
})

// 정산 정보
const settlementInfo = ref({
  bankName: '',
  bankAccount: '',
  bankHolder: '',
})

// 운영 상태
const operationInfo = ref({
  isOpen: true,
  maintenanceMode: false,
  maintenanceMessage: '',
  maintenanceStart: '',
  maintenanceEnd: '',
})

// SEO 설정
const seoInfo = ref({
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  ogImage: '',
  robotsTxt: '',
})

// 소셜 미디어
const socialInfo = ref({
  instagram: '',
  facebook: '',
  youtube: '',
  blog: '',
  kakaoChannel: '',
})

// 알림 설정
const notificationInfo = ref({
  orderEmail: '',
  claimEmail: '',
  inquiryEmail: '',
  enableOrderNotification: true,
  enableClaimNotification: true,
  enableInquiryNotification: true,
})

// 보안 설정
const securityInfo = ref({
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  requirePasswordChange: false,
  passwordChangeDays: 90,
  enableTwoFactor: false,
})

// Mock 데이터 로드
onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  shopInfo.value = {
    shopName: '테스트 쇼핑몰',
    shopNameEn: 'Test Shop',
    logoUrl: '/images/logo.png',
    faviconUrl: '/favicon.ico',
    shopUrl: 'https://shop.example.com',

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

    privacyManager: '김보안',
    privacyEmail: 'privacy@example.com',

    copyright: '© 2025 테스트컴퍼니. All rights reserved.',
  }

  settlementInfo.value = {
    bankName: '신한은행',
    bankAccount: '110-123-456789',
    bankHolder: '(주)테스트컴퍼니',
  }

  operationInfo.value = {
    isOpen: true,
    maintenanceMode: false,
    maintenanceMessage: '시스템 점검 중입니다. 잠시 후 다시 이용해 주세요.',
    maintenanceStart: '',
    maintenanceEnd: '',
  }

  seoInfo.value = {
    metaTitle: '테스트 쇼핑몰 - 최고의 쇼핑 경험',
    metaDescription: '다양한 상품을 합리적인 가격에 만나보세요.',
    metaKeywords: '쇼핑몰, 온라인쇼핑, 패션, 의류',
    ogImage: '/images/og-image.png',
    robotsTxt: 'User-agent: *\nAllow: /',
  }

  socialInfo.value = {
    instagram: 'https://instagram.com/testshop',
    facebook: 'https://facebook.com/testshop',
    youtube: '',
    blog: 'https://blog.naver.com/testshop',
    kakaoChannel: '',
  }

  notificationInfo.value = {
    orderEmail: 'order@example.com',
    claimEmail: 'claim@example.com',
    inquiryEmail: 'cs@example.com',
    enableOrderNotification: true,
    enableClaimNotification: true,
    enableInquiryNotification: true,
  }

  securityInfo.value = {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requirePasswordChange: false,
    passwordChangeDays: 90,
    enableTwoFactor: false,
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
    message: '설정이 저장되었습니다.',
  })
}

// 세션 타임아웃 옵션
const sessionTimeoutOptions = [
  { value: 15, label: '15분' },
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 120, label: '2시간' },
  { value: 480, label: '8시간' },
]

// 비밀번호 변경 주기 옵션
const passwordChangeDaysOptions = [
  { value: 30, label: '30일' },
  { value: 60, label: '60일' },
  { value: 90, label: '90일' },
  { value: 180, label: '180일' },
]

// 은행 옵션
const bankOptions = [
  '신한은행',
  '국민은행',
  '우리은행',
  '하나은행',
  '기업은행',
  '농협은행',
  '카카오뱅크',
  '토스뱅크',
]
</script>

<template>
  <LayoutFormPage
    title="기본 설정"
    description="쇼핑몰의 기본 설정을 관리합니다."
    :is-saving="isSaving"
    @save="handleSave"
  >
    <!-- Tabs -->
    <template #header>
      <div class="border-b border-neutral-200 mt-4 -mx-6 px-6">
        <nav class="flex gap-1 -mb-px overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </template>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <UiSpinner size="lg" />
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- 쇼핑몰 정보 탭 (푸터 정보 포함) -->
      <template v-if="activeTab === 'shop'">
        <!-- 기본 정보 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">쇼핑몰 기본 정보</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                쇼핑몰 이름 (한글) <span class="text-error-500">*</span>
              </label>
              <input
                v-model="shopInfo.shopName"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="쇼핑몰 이름"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                쇼핑몰 이름 (영문)
              </label>
              <input
                v-model="shopInfo.shopNameEn"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Shop Name"
              >
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                쇼핑몰 URL
              </label>
              <input
                v-model="shopInfo.shopUrl"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://shop.example.com"
              >
            </div>
          </div>
        </UiCard>

        <!-- 로고 및 파비콘 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">로고 및 파비콘</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                로고 이미지
              </label>
              <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <div v-if="shopInfo.logoUrl" class="mb-3">
                  <img :src="shopInfo.logoUrl" alt="로고" class="h-12 mx-auto">
                </div>
                <UiButton variant="outline" size="sm">이미지 업로드</UiButton>
                <p class="text-xs text-neutral-500 mt-2">권장: 200x60px, PNG/SVG</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">
                파비콘
              </label>
              <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <div v-if="shopInfo.faviconUrl" class="mb-3">
                  <img :src="shopInfo.faviconUrl" alt="파비콘" class="h-8 w-8 mx-auto">
                </div>
                <UiButton variant="outline" size="sm">이미지 업로드</UiButton>
                <p class="text-xs text-neutral-500 mt-2">권장: 32x32px, ICO/PNG</p>
              </div>
            </div>
          </div>
        </UiCard>

        <!-- 사업자 정보 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">사업자 정보</h3>
            <p class="text-sm text-neutral-500 mt-1">푸터에 표시되는 사업자 정보입니다.</p>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                상호명 <span class="text-error-500">*</span>
              </label>
              <input
                v-model="shopInfo.businessName"
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
                v-model="shopInfo.businessNumber"
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
                v-model="shopInfo.businessType"
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
                v-model="shopInfo.businessCategory"
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
                v-model="shopInfo.mailOrderNumber"
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
                v-model="shopInfo.ceoName"
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
                v-model="shopInfo.ceoPhone"
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
                v-model="shopInfo.ceoEmail"
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
                v-model="shopInfo.zipcode"
                type="text"
                class="w-32 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="우편번호"
                readonly
              >
              <UiButton variant="outline" size="sm">주소 검색</UiButton>
            </div>
            <div>
              <input
                v-model="shopInfo.address1"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="기본 주소"
                readonly
              >
            </div>
            <div>
              <input
                v-model="shopInfo.address2"
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
                v-model="shopInfo.csPhone"
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
                v-model="shopInfo.csFax"
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
                v-model="shopInfo.csEmail"
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
                v-model="shopInfo.csHours"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="평일 09:00 ~ 18:00"
              >
            </div>
          </div>
        </UiCard>

        <!-- 개인정보 관리 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">개인정보 관리</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                개인정보관리책임자
              </label>
              <input
                v-model="shopInfo.privacyManager"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="담당자명"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                개인정보 관련 이메일
              </label>
              <input
                v-model="shopInfo.privacyEmail"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="privacy@example.com"
              >
            </div>
          </div>
        </UiCard>

        <!-- 저작권 -->
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">저작권 문구</h3>
          </template>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">
              푸터 저작권 문구
            </label>
            <input
              v-model="shopInfo.copyright"
              type="text"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="© 2025 회사명. All rights reserved."
            >
            <p class="text-xs text-neutral-500 mt-1">푸터 하단에 표시되는 저작권 문구입니다.</p>
          </div>
        </UiCard>
      </template>

      <!-- 정산 정보 탭 -->
      <template v-if="activeTab === 'settlement'">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">정산 계좌 정보</h3>
            <p class="text-sm text-neutral-500 mt-1">정산금이 입금되는 계좌 정보입니다.</p>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                은행명
              </label>
              <select
                v-model="settlementInfo.bankName"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">선택하세요</option>
                <option v-for="bank in bankOptions" :key="bank" :value="bank">
                  {{ bank }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                계좌번호
              </label>
              <input
                v-model="settlementInfo.bankAccount"
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
                v-model="settlementInfo.bankHolder"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="예금주명"
              >
            </div>
          </div>
        </UiCard>
      </template>

      <!-- 운영 상태 탭 -->
      <template v-if="activeTab === 'operation'">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">쇼핑몰 운영 상태</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900">쇼핑몰 운영</p>
                <p class="text-sm text-neutral-500">쇼핑몰 오픈/클로즈 상태를 설정합니다.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="operationInfo.isOpen" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">점검 모드</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900">점검 모드 활성화</p>
                <p class="text-sm text-neutral-500">활성화 시 고객에게 점검 안내 페이지가 표시됩니다.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="operationInfo.maintenanceMode" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning-500" />
              </label>
            </div>

            <div v-if="operationInfo.maintenanceMode" class="space-y-4 pt-2">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">
                  점검 안내 메시지
                </label>
                <textarea
                  v-model="operationInfo.maintenanceMessage"
                  rows="3"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="고객에게 표시될 점검 안내 메시지"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">
                    점검 시작 일시
                  </label>
                  <input
                    v-model="operationInfo.maintenanceStart"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">
                    점검 종료 일시
                  </label>
                  <input
                    v-model="operationInfo.maintenanceEnd"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </template>

      <!-- SEO 설정 탭 -->
      <template v-if="activeTab === 'seo'">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">기본 메타 정보</h3>
          </template>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                메타 타이틀
              </label>
              <input
                v-model="seoInfo.metaTitle"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="검색 결과에 표시될 사이트 제목"
              >
              <p class="text-xs text-neutral-500 mt-1">{{ seoInfo.metaTitle.length }}/60자 권장</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                메타 설명
              </label>
              <textarea
                v-model="seoInfo.metaDescription"
                rows="2"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="검색 결과에 표시될 사이트 설명"
              />
              <p class="text-xs text-neutral-500 mt-1">{{ seoInfo.metaDescription.length }}/160자 권장</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                메타 키워드
              </label>
              <input
                v-model="seoInfo.metaKeywords"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="쉼표로 구분하여 입력"
              >
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">OG(Open Graph) 이미지</h3>
          </template>
          <div>
            <p class="text-sm text-neutral-500 mb-3">SNS 공유 시 표시되는 대표 이미지입니다.</p>
            <div class="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <div v-if="seoInfo.ogImage" class="mb-3">
                <img :src="seoInfo.ogImage" alt="OG 이미지" class="max-h-32 mx-auto rounded">
              </div>
              <UiButton variant="outline" size="sm">이미지 업로드</UiButton>
              <p class="text-xs text-neutral-500 mt-2">권장: 1200x630px, JPG/PNG</p>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">robots.txt</h3>
          </template>
          <div>
            <textarea
              v-model="seoInfo.robotsTxt"
              rows="5"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="robots.txt 내용"
            />
          </div>
        </UiCard>
      </template>

      <!-- 소셜 미디어 탭 -->
      <template v-if="activeTab === 'social'">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">소셜 미디어 링크</h3>
            <p class="text-sm text-neutral-500 mt-1">푸터 및 사이트 곳곳에 표시되는 SNS 링크입니다.</p>
          </template>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                Instagram
              </label>
              <input
                v-model="socialInfo.instagram"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://instagram.com/yourshop"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                Facebook
              </label>
              <input
                v-model="socialInfo.facebook"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://facebook.com/yourshop"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                YouTube
              </label>
              <input
                v-model="socialInfo.youtube"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://youtube.com/@yourshop"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                블로그
              </label>
              <input
                v-model="socialInfo.blog"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://blog.naver.com/yourshop"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                카카오 채널
              </label>
              <input
                v-model="socialInfo.kakaoChannel"
                type="url"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://pf.kakao.com/_xxxxx"
              >
            </div>
          </div>
        </UiCard>
      </template>

      <!-- 알림 설정 탭 -->
      <template v-if="activeTab === 'notification'">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">알림 수신 이메일</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                주문 알림 수신
              </label>
              <input
                v-model="notificationInfo.orderEmail"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="order@example.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                클레임 알림 수신
              </label>
              <input
                v-model="notificationInfo.claimEmail"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="claim@example.com"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                문의 알림 수신
              </label>
              <input
                v-model="notificationInfo.inquiryEmail"
                type="email"
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="cs@example.com"
              >
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">알림 활성화</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900">주문 알림</p>
                <p class="text-sm text-neutral-500">신규 주문 발생 시 이메일 알림을 받습니다.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="notificationInfo.enableOrderNotification" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900">클레임 알림</p>
                <p class="text-sm text-neutral-500">취소/교환/반품 요청 시 이메일 알림을 받습니다.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="notificationInfo.enableClaimNotification" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900">문의 알림</p>
                <p class="text-sm text-neutral-500">고객 문의 등록 시 이메일 알림을 받습니다.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="notificationInfo.enableInquiryNotification" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>
          </div>
        </UiCard>
      </template>

      <!-- 보안 설정 탭 -->
      <template v-if="activeTab === 'security'">
        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">세션 설정</h3>
          </template>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                세션 타임아웃
              </label>
              <select
                v-model="securityInfo.sessionTimeout"
                class="w-full md:w-64 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="opt in sessionTimeoutOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <p class="text-xs text-neutral-500 mt-1">활동이 없을 경우 자동 로그아웃되는 시간</p>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">로그인 보안</h3>
          </template>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">
                  최대 로그인 시도 횟수
                </label>
                <input
                  v-model.number="securityInfo.maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">
                  계정 잠금 시간 (분)
                </label>
                <input
                  v-model.number="securityInfo.lockoutDuration"
                  type="number"
                  min="1"
                  max="60"
                  class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
            </div>
          </div>
        </UiCard>

        <UiCard>
          <template #header>
            <h3 class="font-semibold text-neutral-900">비밀번호 정책</h3>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div>
                <p class="font-medium text-neutral-900">주기적 비밀번호 변경 요구</p>
                <p class="text-sm text-neutral-500">설정된 주기마다 비밀번호 변경을 요구합니다.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="securityInfo.requirePasswordChange" type="checkbox" class="sr-only peer">
                <div class="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>

            <div v-if="securityInfo.requirePasswordChange">
              <label class="block text-sm font-medium text-neutral-700 mb-1">
                비밀번호 변경 주기
              </label>
              <select
                v-model="securityInfo.passwordChangeDays"
                class="w-full md:w-64 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option v-for="opt in passwordChangeDaysOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </UiCard>
      </template>
    </div>
  </LayoutFormPage>
</template>
