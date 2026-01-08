/**
 * Mock User Detail API
 * GET /api/users/:id
 */

// Mock 회원 상세 데이터
const mockUserDetails = {
  1: {
    id: 1,
    userId: 'user001',
    name: '김철수',
    phone: '010-1234-5678',
    email: 'kim@example.com',
    grade: 'VIP',
    status: 'active',
    point: 15000,
    createdAt: '2024-01-15',
    lastLoginAt: '2025-01-06 14:30',
    birthDate: '1990-05-20',
    gender: 'male',
    address: {
      zipcode: '06234',
      address1: '서울시 강남구 테헤란로 123',
      address2: '456호',
    },
    memo: 'VIP 고객, 응대 시 주의',
    stats: {
      orderCount: 45,
      totalSpent: 1250000,
      avgOrderAmount: 27778,
      cancelCount: 2,
      returnCount: 1,
    },
  },
  2: {
    id: 2,
    userId: 'user002',
    name: '이영희',
    phone: '010-2345-6789',
    email: 'lee@example.com',
    grade: '일반',
    status: 'active',
    point: 3500,
    createdAt: '2024-02-20',
    lastLoginAt: '2025-01-05 09:15',
    birthDate: '1985-11-10',
    gender: 'female',
    address: {
      zipcode: '13487',
      address1: '경기도 성남시 분당구 판교로 234',
      address2: '102동 1503호',
    },
    memo: '',
    stats: {
      orderCount: 12,
      totalSpent: 340000,
      avgOrderAmount: 28333,
      cancelCount: 0,
      returnCount: 0,
    },
  },
}

// Mock 주문 내역
const mockOrders = {
  1: [
    { id: '1001', date: '2025-01-05', products: '겨울 패딩 자켓 외 2건', amount: 189000, status: 'delivered' },
    { id: '998', date: '2025-01-02', products: '니트 스웨터', amount: 59000, status: 'delivered' },
    { id: '987', date: '2024-12-28', products: '청바지 외 1건', amount: 98000, status: 'delivered' },
    { id: '965', date: '2024-12-20', products: '겨울 부츠', amount: 129000, status: 'delivered' },
    { id: '943', date: '2024-12-15', products: '목도리 세트', amount: 45000, status: 'cancelled' },
  ],
  2: [
    { id: '1005', date: '2025-01-06', products: '블라우스', amount: 45000, status: 'shipping' },
    { id: '992', date: '2024-12-30', products: '스커트 세트', amount: 78000, status: 'delivered' },
  ],
}

export default defineEventHandler((event) => {
  const id = parseInt(getRouterParam(event, 'id'))

  const user = mockUserDetails[id]

  if (!user) {
    // 기본 데이터 생성
    const defaultUser = {
      id,
      userId: `user${String(id).padStart(3, '0')}`,
      name: `테스트 유저 ${id}`,
      phone: '010-0000-0000',
      email: `user${id}@example.com`,
      grade: '일반',
      status: 'active',
      point: 0,
      createdAt: '2024-01-01',
      lastLoginAt: '2025-01-01 00:00',
      birthDate: null,
      gender: null,
      address: null,
      memo: '',
      stats: {
        orderCount: 0,
        totalSpent: 0,
        avgOrderAmount: 0,
        cancelCount: 0,
        returnCount: 0,
      },
    }

    return {
      user: defaultUser,
      orders: [],
    }
  }

  return {
    user,
    orders: mockOrders[id] || [],
  }
})
