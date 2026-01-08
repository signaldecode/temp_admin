/**
 * Mock Login API
 * POST /api/auth/login
 * 개발/테스트용 - 프로덕션에서는 실제 백엔드 API로 교체
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 테스트 계정: test / 1234
  if (body.email === 'test' && body.password === '1234') {
    // HttpOnly Cookie 설정 (개발용 mock)
    setCookie(event, 'auth_token', 'mock_jwt_token_for_dev', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return {
      success: true,
      message: '로그인 성공',
    }
  }

  // 로그인 실패
  throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  })
})
