/**
 * Mock Me API
 * GET /api/me
 * 현재 로그인된 유저 정보 반환
 */
export default defineEventHandler((event) => {
  // 쿠키에서 토큰 확인
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '인증이 필요합니다.',
    })
  }

  // Mock 유저 데이터 반환
  return {
    user: {
      id: 1,
      name: '관리자',
      email: 'test@example.com',
      role: 'admin',
      // Phase 2 확장용 테넌트 정보
      tenants: [
        {
          id: 'default',
          name: '기본 서비스',
        },
      ],
    },
    permissions: [
      'dashboard.view',
      'orders.view',
      'orders.edit',
      'products.view',
      'products.edit',
      'users.view',
      'contents.view',
      'contents.edit',
      'statistics.view',
      'settings.view',
    ],
    currentTenant: {
      id: 'default',
      name: '기본 서비스',
    },
  }
})
