export type UserRole = 'ROLE_READER' | 'ROLE_LIBRARIAN' | 'ROLE_ADMIN'

export interface User {
  username: string
  role: UserRole
  token: string
}

export interface Book {
  isbn: string
  title: string
  author: string
  publisher: string
  category: string
  location: string
  status: '在馆' | '借出' | '修复' | '遗失'
  entry_date: string
}

export interface Reader {
  reader_id: string
  name: string
  phone: string
  email: string
  reg_date: string
  status: '正常' | '注销'
}

export interface BorrowRecord {
  borrow_id: number
  reader_id: string
  isbn: string
  borrow_date: string
  due_date: string
  return_date?: string
  fine: number
  title?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
}

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface SystemConfig {
  [key: string]: string
  max_borrow_count: string
  borrow_days: string
  overdue_fine_per_day: string
}

export interface BorrowRankItem {
  title: string
  count: number
}

export interface CategoryStatItem {
  category: string
  count: number
}

export interface OverdueItem {
  reader_id: string
  name: string
  title: string
  due_date: string
  overdue_days: number
  fine: number
}

export interface MonthlyStatItem {
  month: string
  count: number
}
