import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole } from '../types'

interface AuthContextType {
  role: UserRole | null
  username: string | null
  token: string | null
  login: (token: string, role: UserRole, username: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role') as UserRole
    const savedUsername = localStorage.getItem('username')
    
    if (savedToken && savedRole) {
      setToken(savedToken)
      setRole(savedRole)
      setUsername(savedUsername)
    }
  }, [])

  const login = (newToken: string, newRole: UserRole, newUsername: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('role', newRole)
    localStorage.setItem('username', newUsername)
    setToken(newToken)
    setRole(newRole)
    setUsername(newUsername)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('username')
    setToken(null)
    setRole(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ role, username, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
