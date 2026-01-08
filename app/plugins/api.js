/**
 * API Plugin
 * API 호출 유틸리티를 전역으로 제공
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase

  /**
   * API 요청 헬퍼
   */
  const api = {
    /**
     * GET 요청
     */
    async get(endpoint, params = {}) {
      const searchParams = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value)
        }
      })

      const queryString = searchParams.toString()
      const url = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`

      return await $fetch(url, {
        method: 'GET',
        credentials: 'include',
      })
    },

    /**
     * POST 요청
     */
    async post(endpoint, body = {}) {
      return await $fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body,
      })
    },

    /**
     * PUT 요청
     */
    async put(endpoint, body = {}) {
      return await $fetch(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        body,
      })
    },

    /**
     * PATCH 요청
     */
    async patch(endpoint, body = {}) {
      return await $fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        credentials: 'include',
        body,
      })
    },

    /**
     * DELETE 요청
     */
    async delete(endpoint, body = {}) {
      return await $fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        credentials: 'include',
        body,
      })
    },
  }

  return {
    provide: {
      api,
    },
  }
})
