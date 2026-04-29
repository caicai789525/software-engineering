import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Select, Space, Tag, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Book } from '../types'
import { mockAPI } from '../services/mock'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

const statusColorMap: Record<string, string> = {
  '在馆': 'green',
  '借出': 'red',
  '修复': 'orange',
  '遗失': 'default'
}

export default function Books() {
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>()
  const [status, setStatus] = useState<string>()
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const result = await mockAPI.getBooks({
        keyword,
        category,
        status,
        page,
        size: pageSize
      })
      setBooks(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取图书列表失败')
    } finally {
      setLoading(false)
    }
  }, [keyword, category, status, page, pageSize])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearch = (value: string) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => {
      setKeyword(value)
      setPage(1)
    }, 300)
    setDebounceTimer(timer)
  }

  const columns: ColumnsType<Book> = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 180
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '出版社',
      dataIndex: 'publisher',
      key: 'publisher'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '书架位置',
      dataIndex: 'location',
      key: 'location',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>图书查询</h2>
      
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索书名、作者或ISBN"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
        <Select
          placeholder="选择分类"
          style={{ width: 150 }}
          allowClear
          onChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
        >
          <Option value="计算机">计算机</Option>
          <Option value="文学">文学</Option>
          <Option value="科幻">科幻</Option>
          <Option value="历史">历史</Option>
          <Option value="哲学">哲学</Option>
        </Select>
        <Select
          placeholder="选择状态"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <Option value="在馆">在馆</Option>
          <Option value="借出">借出</Option>
          <Option value="修复">修复</Option>
          <Option value="遗失">遗失</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={books}
        rowKey="isbn"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage)
            if (newPageSize !== pageSize) setPageSize(newPageSize)
          }
        }}
        locale={{
          emptyText: '没有找到符合条件的图书'
        }}
      />
    </div>
  )
}
