/**
 * Mock Logout API
 * POST /api/auth/logout
 */
export default defineEventHandler((event) => {
  // 쿠키 삭제
  deleteCookie(event, 'auth_token', {
    path: '/',
  })

  return {
    success: true,
    message: '로그아웃 성공',
  }
})
