import React, { useState } from 'react'
import { Layout as AntLayout, Menu, theme, Button, Avatar, Dropdown, Space } from 'antd'
import { BookOutlined, UserOutlined, SwapOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types'

const { Header, Content, Sider } = AntLayout

interface MenuItem {
  key: string
  icon: React.ReactNode
  label: string
  path: string
  roles: UserRole[]
}

const menuItems: MenuItem[] = [
  {
    key: '/books',
    icon: <BookOutlined />,
    label: '图书查询',
    path: '/books',
    roles: ['ROLE_READER', 'ROLE_LIBRARIAN', 'ROLE_ADMIN']
  },
  {
    key: '/borrow-return',
    icon: <SwapOutlined />,
    label: '借阅归还',
    path: '/borrow-return',
    roles: ['ROLE_LIBRARIAN', 'ROLE_ADMIN']
  },
  {
    key: '/readers',
    icon: <UserOutlined />,
    label: '读者管理',
    path: '/readers',
    roles: ['ROLE_LIBRARIAN', 'ROLE_ADMIN']
  },
  {
    key: '/statistics',
    icon: <BarChartOutlined />,
    label: '统计报表',
    path: '/statistics',
    roles: ['ROLE_LIBRARIAN', 'ROLE_ADMIN']
  },
  {
    key: '/system-config',
    icon: <SettingOutlined />,
    label: '系统配置',
    path: '/system-config',
    roles: ['ROLE_ADMIN']
  }
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { role, username, logout } = useAuth()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const filteredMenuItems = menuItems.filter(item => 
    role && item.roles.includes(role)
  )

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout()
        navigate('/login')
      }
    }
  ]

  const getRoleName = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      'ROLE_READER': '读者',
      'ROLE_LIBRARIAN': '图书管理员',
      'ROLE_ADMIN': '系统管理员'
    }
    return names[role] || role
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        width={200}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold'
        }}>
          {collapsed ? '📚' : '📚 图书管理系统'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={filteredMenuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            欢迎使用图书管理系统
          </div>
          <Dropdown menu={{ items: userMenuItems }}>
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <div>
                <div style={{ fontSize: 14 }}>{username}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{role && getRoleName(role)}</div>
              </div>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
