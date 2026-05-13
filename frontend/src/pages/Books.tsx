import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Select, Space, Tag, message, Button, Modal, Form } from 'antd'
import { SearchOutlined, BookOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Book } from '../types'
import { bookAPI, borrowAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { TextArea } = Input

const statusColorMap: Record<string, string> = {
  '在馆': 'green',
  '借出': 'red',
  '修复': 'orange',
  '遗失': 'default'
}

const categories = ['计算机', '文学', '科幻', '历史', '哲学']

export default function Books() {
  const { role } = useAuth()
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState<Book[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>()
  const [status, setStatus] = useState<string>()
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>()
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()

  const isReader = role === 'ROLE_READER'

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const result = await bookAPI.getBooks({
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

  const handleBorrow = async (book: Book) => {
    if (!book.book_id || book.status !== '在馆') return

    try {
      setLoading(true)
      await borrowAPI.borrowBook({
        reader_id: '20260001',
        book_id: book.book_id
      })
      message.success('借阅成功')
      fetchBooks()
    } catch (error) {
      message.error('借阅失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    form.setFieldsValue(book)
    setEditModalVisible(true)
  }

  const handleUpdate = async () => {
    if (!editingBook?.book_id) return
    try {
      const values = await form.validateFields()
      setLoading(true)
      await bookAPI.updateBook(editingBook.book_id, values)
      message.success('更新成功')
      setEditModalVisible(false)
      fetchBooks()
    } catch (error) {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (book: Book) => {
    if (!book.book_id) return
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除图书《${book.title}》吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setLoading(true)
          await bookAPI.deleteBook(book.book_id)
          message.success('删除成功')
          fetchBooks()
        } catch (error) {
          message.error('删除失败')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleUpdateStatus = async (book: Book, newStatus: string) => {
    if (!book.book_id) return
    try {
      setLoading(true)
      await bookAPI.updateBookStatus(book.book_id, newStatus)
      message.success('状态更新成功')
      fetchBooks()
    } catch (error) {
      message.error('状态更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields()
      setLoading(true)
      await bookAPI.createBook(values)
      message.success('添加成功')
      setAddModalVisible(false)
      addForm.resetFields()
      fetchBooks()
    } catch (error) {
      message.error('添加失败')
    } finally {
      setLoading(false)
    }
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
      render: (status: string, record: Book) => (
        <Space>
          <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>
          {!isReader && (
            <Select
              value={status}
              size="small"
              style={{ width: 80 }}
              onChange={(value) => handleUpdateStatus(record, value)}
            >
              <Option value="在馆">在馆</Option>
              <Option value="借出">借出</Option>
              <Option value="修复">修复</Option>
              <Option value="遗失">遗失</Option>
            </Select>
          )}
        </Space>
      )
    },
    {
      title: '入库日期',
      dataIndex: 'entry_date',
      key: 'entry_date',
      width: 120,
      render: (date: string) => {
        if (date) {
          const d = new Date(date)
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        }
        return '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: Book) => (
        isReader ? (
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => handleBorrow(record)}
            size="small"
            disabled={record.status !== '在馆'}
          >
            借阅
          </Button>
        ) : (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            >
              修改
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              size="small"
            >
              删除
            </Button>
          </Space>
        )
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>图书查询</h2>
        {!isReader && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            添加图书
          </Button>
        )}
      </div>

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
          {categories.map(cat => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
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
        rowKey="book_id"
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

      <Modal
        title="编辑图书"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="isbn" label="ISBN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="title" label="书名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="出版社" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select>
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="location" label="书架位置" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加图书"
        open={addModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setAddModalVisible(false)
          addForm.resetFields()
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="isbn" label="ISBN" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="title" label="书名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="作者" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="出版社" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select>
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="location" label="书架位置" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
