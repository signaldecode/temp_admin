/**
 * API 프록시 미들웨어
 * - /api/** 요청을 백엔드로 프록시
 * - 쿠키 양방향 전달 (Safari 호환)
 */

export default defineEventHandler(async (event) => {
  const path = event.path

  // /api로 시작하는 요청만 처리
  if (!path.startsWith('/api')) {
    return
  }

  const targetBase = process.env.API_BASE_URL || 'https://api-admin.sigdec.click/api/v1'
  const targetPath = path.replace(/^\/api/, '')
  const targetUrl = `${targetBase}${targetPath}`

  // 요청 헤더
  const reqHeaders = getHeaders(event)
  const headers = {
    'content-type': reqHeaders['content-type'] || 'application/json',
    'accept': reqHeaders.accept || 'application/json',
  }

  // 쿠키 전달 (브라우저 → 백엔드)
  if (reqHeaders.cookie) {
    headers.cookie = reqHeaders.cookie
  }

  // 요청 바디
  let body = undefined
  const method = event.method
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    try {
      body = await readBody(event)
    } catch (e) {
      // body 없는 경우 무시
    }
  }

  try {
    const response = await $fetch.raw(targetUrl, {
      method,
      headers,
      body,
    })

    // Set-Cookie 전달 (백엔드 → 브라우저)
    const setCookies = response.headers.getSetCookie?.() || []
    setCookies.forEach((cookie) => {
      // Safari/로컬 환경 호환을 위해 쿠키 속성 수정
      let modifiedCookie = cookie
        .replace(/;\s*Secure/gi, '')
        .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
        .replace(/;\s*Domain=[^;]*/gi, '')
        .replace(/Path=\/api\/v1/gi, 'Path=/api')  // 프록시 경로에 맞게 수정

      console.log('Original cookie:', cookie)
      console.log('Modified cookie:', modifiedCookie)

      appendResponseHeader(event, 'set-cookie', modifiedCookie)
    })

    return response._data
  } catch (error) {
    const status = error.status || error.statusCode || 500
    setResponseStatus(event, status)
    return error.data || { error: error.message }
  }
})
