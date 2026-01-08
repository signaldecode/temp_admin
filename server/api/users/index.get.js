/**
 * Mock Users List API
 * GET /api/users
 */

// Mock 회원 데이터
const mockUsers = [
  { id: 1, userId: 'user001', name: '김철수', phone: '010-1234-5678', email: 'kim@example.com', grade: 'VIP', status: 'active', createdAt: '2024-01-15', orderCount: 45, totalSpent: 1250000 },
  { id: 2, userId: 'user002', name: '이영희', phone: '010-2345-6789', email: 'lee@example.com', grade: '일반', status: 'active', createdAt: '2024-02-20', orderCount: 12, totalSpent: 340000 },
  { id: 3, userId: 'user003', name: '박민수', phone: '010-3456-7890', email: 'park@example.com', grade: '일반', status: 'active', createdAt: '2024-03-10', orderCount: 8, totalSpent: 180000 },
  { id: 4, userId: 'user004', name: '정수진', phone: '010-4567-8901', email: 'jung@example.com', grade: 'VIP', status: 'active', createdAt: '2024-03-25', orderCount: 67, totalSpent: 2890000 },
  { id: 5, userId: 'user005', name: '최동욱', phone: '010-5678-9012', email: 'choi@example.com', grade: '일반', status: 'dormant', createdAt: '2023-11-05', orderCount: 3, totalSpent: 89000 },
  { id: 6, userId: 'user006', name: '강미영', phone: '010-6789-0123', email: 'kang@example.com', grade: 'VVIP', status: 'active', createdAt: '2023-06-12', orderCount: 156, totalSpent: 8750000 },
  { id: 7, userId: 'user007', name: '윤서준', phone: '010-7890-1234', email: 'yoon@example.com', grade: '일반', status: 'active', createdAt: '2024-05-08', orderCount: 5, totalSpent: 125000 },
  { id: 8, userId: 'user008', name: '임지현', phone: '010-8901-2345', email: 'lim@example.com', grade: 'VIP', status: 'active', createdAt: '2024-01-22', orderCount: 38, totalSpent: 980000 },
  { id: 9, userId: 'user009', name: '한승우', phone: '010-9012-3456', email: 'han@example.com', grade: '일반', status: 'withdrawn', createdAt: '2023-09-15', orderCount: 2, totalSpent: 45000 },
  { id: 10, userId: 'user010', name: '오세영', phone: '010-0123-4567', email: 'oh@example.com', grade: '일반', status: 'active', createdAt: '2024-06-01', orderCount: 1, totalSpent: 32000 },
]

export default defineEventHandler((event) => {
  const query = getQuery(event)

  let result = [...mockUsers]

  // 검색 필터링
  if (query.keyword && query.type) {
    const keyword = query.keyword.toLowerCase()
    result = result.filter((user) => {
      switch (query.type) {
        case 'userId':
          return user.userId.toLowerCase().includes(keyword)
        case 'name':
          return user.name.toLowerCase().includes(keyword)
        case 'phone':
          return user.phone.replace(/-/g, '').includes(keyword.replace(/-/g, ''))
        default:
          return true
      }
    })
  }

  // 페이지네이션
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 20
  const total = result.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const end = start + limit

  return {
    users: result.slice(start, end),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
})
