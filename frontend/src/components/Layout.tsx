import React, { useState } from 'react'
import { Layout as AntLayout, Menu, Button, Modal } from 'antd'
import {
  BookOutlined,
  FileTextOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  IdcardOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'

const { Header, Sider, Content } = AntLayout

const menuItems: { key: string; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
  { key: '/books', label: '图书查询', icon: <BookOutlined />, roles: ['ROLE_READER', 'ROLE_LIBRARIAN', 'ROLE_ADMIN'] },
  { key: '/borrow-return', label: '借阅归还', icon: <FileTextOutlined />, roles: ['ROLE_LIBRARIAN', 'ROLE_ADMIN'] },
  { key: '/readers', label: '读者管理', icon: <UserOutlined />, roles: ['ROLE_LIBRARIAN', 'ROLE_ADMIN'] },
  { key: '/statistics', label: '统计分析', icon: <BarChartOutlined />, roles: ['ROLE_LIBRARIAN', 'ROLE_ADMIN'] },
  { key: '/system-config', label: '系统配置', icon: <SettingOutlined />, roles: ['ROLE_ADMIN'] },
  { key: '/profile', label: '个人中心', icon: <IdcardOutlined />, roles: ['ROLE_READER'] }
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { role, username, logout } = useAuth()
  const navigate = useNavigate()

  const filteredMenuItems = menuItems.filter(item =>
    !item.roles.length || item.roles.includes(role!)
  )

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        logout()
        navigate('/login')
      }
    })
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          color: '#fff'
        }}>
          {collapsed ? '图书' : '图书管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[window.location.pathname]}
          onClick={handleMenuClick}
          items={filteredMenuItems.map(item => ({
            key: item.key,
            label: item.label,
            icon: item.icon
          }))}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: 0, 
          background: '#fff', 
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: 16,
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}>
            <Button type="text" style={{ padding: '0 16px' }} onClick={handleLogout}>
              {username}
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f0f2f5'
          }}
        >
          <div style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 200px)' }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}