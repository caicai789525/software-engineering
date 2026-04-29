import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Books from './pages/Books'
import BorrowReturn from './pages/BorrowReturn'
import Readers from './pages/Readers'
import Statistics from './pages/Statistics'
import SystemConfig from './pages/SystemConfig'

export default function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/books" replace />} />
              <Route path="books" element={
                <ProtectedRoute allowedRoles={['ROLE_READER', 'ROLE_LIBRARIAN', 'ROLE_ADMIN']}>
                  <Books />
                </ProtectedRoute>
              } />
              <Route path="borrow-return" element={
                <ProtectedRoute allowedRoles={['ROLE_LIBRARIAN', 'ROLE_ADMIN']}>
                  <BorrowReturn />
                </ProtectedRoute>
              } />
              <Route path="readers" element={
                <ProtectedRoute allowedRoles={['ROLE_LIBRARIAN', 'ROLE_ADMIN']}>
                  <Readers />
                </ProtectedRoute>
              } />
              <Route path="statistics" element={
                <ProtectedRoute allowedRoles={['ROLE_LIBRARIAN', 'ROLE_ADMIN']}>
                  <Statistics />
                </ProtectedRoute>
              } />
              <Route path="system-config" element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <SystemConfig />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  )
}
