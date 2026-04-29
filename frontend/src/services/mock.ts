import { Book, Reader, BorrowRecord, PageResult, SystemConfig, BorrowRankItem, CategoryStatItem, OverdueItem, MonthlyStatItem } from '../types'

const mockBooks: Book[] = [
  { isbn: '978-7-111-11111-1', title: 'Go语言圣经', author: 'Alan A.A.Donovan', publisher: '人民邮电出版社', category: '计算机', location: 'A区-01架', status: '在馆', entry_date: '2024-01-01T00:00:00Z' },
  { isbn: '978-7-111-22222-2', title: '深入理解计算机系统', author: 'Randal E.Bryant', publisher: '机械工业出版社', category: '计算机', location: 'A区-02架', status: '借出', entry_date: '2024-01-02T00:00:00Z' },
  { isbn: '978-7-111-33333-3', title: '算法导论', author: 'Thomas H.Cormen', publisher: '机械工业出版社', category: '计算机', location: 'A区-03架', status: '在馆', entry_date: '2024-01-03T00:00:00Z' },
  { isbn: '978-7-111-44444-4', title: '红楼梦', author: '曹雪芹', publisher: '人民文学出版社', category: '文学', location: 'B区-01架', status: '在馆', entry_date: '2024-01-04T00:00:00Z' },
  { isbn: '978-7-111-55555-5', title: '三体', author: '刘慈欣', publisher: '重庆出版社', category: '科幻', location: 'B区-02架', status: '修复', entry_date: '2024-01-05T00:00:00Z' }
]

const mockReaders: Reader[] = [
  { reader_id: '202401010001', name: '张三', phone: '13800138001', email: 'zhangsan@example.com', reg_date: '2024-01-01T00:00:00Z', status: '正常' },
  { reader_id: '202401010002', name: '李四', phone: '13800138002', email: 'lisi@example.com', reg_date: '2024-01-02T00:00:00Z', status: '正常' },
  { reader_id: '202401010003', name: '王五', phone: '13800138003', email: 'wangwu@example.com', reg_date: '2024-01-03T00:00:00Z', status: '注销' }
]

const mockBorrowRecords: BorrowRecord[] = [
  { borrow_id: 1, reader_id: '202401010001', isbn: '978-7-111-22222-2', borrow_date: '2024-04-01', due_date: '2024-04-15', title: '深入理解计算机系统', fine: 0 }
]

const mockConfig: SystemConfig = {
  max_borrow_count: '5',
  borrow_days: '30',
  overdue_fine_per_day: '0.5'
}

const mockBorrowRank: BorrowRankItem[] = [
  { title: 'Go语言圣经', count: 50 },
  { title: '深入理解计算机系统', count: 45 },
  { title: '算法导论', count: 40 },
  { title: '红楼梦', count: 35 },
  { title: '三体', count: 30 },
  { title: '活着', count: 25 },
  { title: '百年孤独', count: 20 },
  { title: '围城', count: 18 },
  { title: '平凡的世界', count: 15 },
  { title: '白鹿原', count: 12 }
]

const mockCategoryStats: CategoryStatItem[] = [
  { category: '计算机', count: 150 },
  { category: '文学', count: 120 },
  { category: '科幻', count: 80 },
  { category: '历史', count: 60 },
  { category: '哲学', count: 40 }
]

const mockOverdueStats: OverdueItem[] = [
  { reader_id: '202401010001', name: '张三', title: '深入理解计算机系统', due_date: '2024-04-15', overdue_days: 5, fine: 2.5 },
  { reader_id: '202401010002', name: '李四', title: '算法导论', due_date: '2024-04-10', overdue_days: 10, fine: 5.0 }
]

const mockMonthlyStats: MonthlyStatItem[] = [
  { month: '1月', count: 120 },
  { month: '2月', count: 90 },
  { month: '3月', count: 150 },
  { month: '4月', count: 130 },
  { month: '5月', count: 140 },
  { month: '6月', count: 160 },
  { month: '7月', count: 180 },
  { month: '8月', count: 170 },
  { month: '9月', count: 200 },
  { month: '10月', count: 190 },
  { month: '11月', count: 160 },
  { month: '12月', count: 140 }
]

export const mockData = {
  books: mockBooks,
  readers: mockReaders,
  borrowRecords: mockBorrowRecords,
  config: mockConfig,
  borrowRank: mockBorrowRank,
  categoryStats: mockCategoryStats,
  overdueStats: mockOverdueStats,
  monthlyStats: mockMonthlyStats
}

export function delay(ms: number = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockAPI = {
  login: async (username: string, password: string) => {
    await delay()
    if (username === 'reader' && password === '123456') {
      return { token: 'mock-token-reader', role: 'ROLE_READER', username: 'reader' }
    } else if (username === 'librarian' && password === '123456') {
      return { token: 'mock-token-librarian', role: 'ROLE_LIBRARIAN', username: 'librarian' }
    } else if (username === 'admin' && password === '123456') {
      return { token: 'mock-token-admin', role: 'ROLE_ADMIN', username: 'admin' }
    }
    throw new Error('用户名或密码错误')
  },

  getBooks: async (params: any): Promise<PageResult<Book>> => {
    await delay()
    let filtered = [...mockBooks]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(keyword) ||
        b.author.toLowerCase().includes(keyword) ||
        b.isbn.includes(keyword)
      )
    }
    if (params.category) {
      filtered = filtered.filter(b => b.category === params.category)
    }
    if (params.status) {
      filtered = filtered.filter(b => b.status === params.status)
    }
    const page = params.page || 1
    const size = params.size || 10
    const start = (page - 1) * size
    return {
      list: filtered.slice(start, start + size),
      total: filtered.length,
      page,
      size
    }
  },

  getReaders: async (params: any): Promise<PageResult<Reader>> => {
    await delay()
    let filtered = [...mockReaders]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(keyword) ||
        r.reader_id.includes(keyword)
      )
    }
    if (params.status) {
      filtered = filtered.filter(r => r.status === params.status)
    }
    const page = params.page || 1
    const size = params.size || 10
    const start = (page - 1) * size
    return {
      list: filtered.slice(start, start + size),
      total: filtered.length,
      page,
      size
    }
  },

  getReaderBorrows: async (readerId: string): Promise<BorrowRecord[]> => {
    await delay()
    return mockBorrowRecords.filter(r => r.reader_id === readerId)
  },

  borrow: async (readerId: string, isbn: string) => {
    await delay()
    const book = mockBooks.find(b => b.isbn === isbn)
    if (!book) throw new Error('图书不存在')
    if (book.status !== '在馆') throw new Error('图书不可借阅')
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    return { title: book.title, due_date: dueDate.toISOString().split('T')[0] }
  },

  returnBook: async (isbn: string) => {
    await delay()
    return { fine: 0 }
  },

  getAllConfigs: async (): Promise<SystemConfig> => {
    await delay()
    return mockConfig
  },

  updateConfig: async (key: string, value: string) => {
    await delay()
    mockConfig[key as keyof SystemConfig] = value
  },

  getBorrowRank: async (): Promise<BorrowRankItem[]> => {
    await delay()
    return mockBorrowRank
  },

  getCategoryStats: async (): Promise<CategoryStatItem[]> => {
    await delay()
    return mockCategoryStats
  },

  getOverdueStats: async (): Promise<OverdueItem[]> => {
    await delay()
    return mockOverdueStats
  },

  getMonthlyStats: async (): Promise<MonthlyStatItem[]> => {
    await delay()
    return mockMonthlyStats
  },

  createReader: async (data: any) => {
    await delay()
    const newReader: Reader = {
      reader_id: '20240424' + String(mockReaders.length + 1).padStart(4, '0'),
      name: data.name,
      phone: data.phone,
      email: data.email,
      reg_date: new Date().toISOString(),
      status: '正常'
    }
    mockReaders.push(newReader)
    return newReader
  },

  updateReader: async (readerId: string, data: any) => {
    await delay()
    const index = mockReaders.findIndex(r => r.reader_id === readerId)
    if (index !== -1) {
      mockReaders[index] = { ...mockReaders[index], ...data }
    }
  },

  deleteReader: async (readerId: string) => {
    await delay()
    const index = mockReaders.findIndex(r => r.reader_id === readerId)
    if (index !== -1) {
      mockReaders.splice(index, 1)
    }
  },

  updateReaderStatus: async (readerId: string, status: string) => {
    await delay()
    const reader = mockReaders.find(r => r.reader_id === readerId)
    if (reader) {
      reader.status = status as '正常' | '注销'
    }
  }
}
