import request from '../utils/request'
import { Book, Reader, BorrowRecord, PageResult, SystemConfig, BorrowRankItem, CategoryStatItem, OverdueItem, MonthlyStatItem, ApiResponse } from '../types'

export const authAPI = {
  login: (username: string, password: string) =>
    request.post<any, { token: string; role: string; username: string }>('/auth/login', { username, password }),
  
  getCurrentUser: () => request.get('/auth/current')
}

export const bookAPI = {
  getBooks: (params: { keyword?: string; category?: string; status?: string; page?: number; size?: number }) =>
    request.get<any, PageResult<Book>>('/books', { params }),
  
  getBook: (bookId: number) => request.get<any, Book>(`/books/${bookId}`),
  
  createBook: (data: Omit<Book, 'book_id' | 'status' | 'entry_date'>) => request.post('/books', data),
  
  updateBook: (bookId: number, data: Partial<Book>) => request.put(`/books/${bookId}`, data),
  
  deleteBook: (bookId: number) => request.delete(`/books/${bookId}`),
  
  updateBookStatus: (bookId: number, status: string) =>
    request.patch(`/books/${bookId}/status`, { status })
}

export const readerAPI = {
  getReaders: (params: { keyword?: string; status?: string; page?: number; size?: number }) =>
    request.get<any, PageResult<Reader>>('/readers', { params }),
  
  getReader: (readerId: string) => request.get<any, Reader>(`/readers/${readerId}`),
  
  createReader: (data: { name: string; phone: string; email: string }) =>
    request.post('/readers', data),
  
  updateReader: (readerId: string, data: Partial<Reader>) =>
    request.put(`/readers/${readerId}`, data),
  
  deleteReader: (readerId: string) => request.delete(`/readers/${readerId}`),
  
  updateReaderStatus: (readerId: string, status: string) =>
    request.patch(`/readers/${readerId}/status`, { status })
}

export const borrowAPI = {
  borrow: (readerId: string, isbn: string) =>
    request.post<any, { title: string; due_date: string }>('/borrow', {
      reader_id: readerId,
      isbn
    }),
  
  returnBook: (isbn: string) =>
    request.post<any, { fine: number }>('/borrow/return', { isbn }),
  
  getReaderBorrows: (readerId: string) =>
    request.get<any, BorrowRecord[]>(`/borrow/reader/${readerId}`)
}

export const statisticsAPI = {
  getBorrowRank: (params?: { start_date?: string; end_date?: string; limit?: number }) =>
    request.get<any, BorrowRankItem[]>('/statistics/borrow-rank', { params }),
  
  getCategoryStats: (params?: { start_date?: string; end_date?: string }) =>
    request.get<any, CategoryStatItem[]>('/statistics/category', { params }),
  
  getOverdueStats: (params?: { start_date?: string; end_date?: string }) =>
    request.get<any, OverdueItem[]>('/statistics/overdue', { params }),
  
  getMonthlyStats: (params?: { year?: number }) =>
    request.get<any, MonthlyStatItem[]>('/statistics/monthly', { params })
}

export const configAPI = {
  getAllConfigs: () => request.get<any, SystemConfig>('/config'),
  
  getConfig: (key: string) => request.get(`/config/${key}`),
  
  updateConfig: (key: string, value: string) =>
    request.put(`/config/${key}`, { value })
}
