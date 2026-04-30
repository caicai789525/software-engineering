import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Select, Space, Tag, message, Button, Modal, Form } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Book } from '../types'
import { bookAPI } from '../services/api'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

const statusColorMap: Record<string, string> = {
  '在馆': 'green',
  '借出': 'red',
  '修复': 'orange',
  '遗失': 'default'
}

const categories = ['计算机', '文学', '科幻', '历史', '哲学']

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
  
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form] = Form.useForm()

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

  const showAddModal = () => {
    setEditingBook(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (book: Book) => {
    setEditingBook(book)
    form.setFieldsValue({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      category: book.category,
      location: book.location
    })
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      if (editingBook && editingBook.book_id) {
        await bookAPI.updateBook(editingBook.book_id, values)
        message.success('图书信息更新成功')
      } else {
        await bookAPI.createBook(values)
        message.success('图书添加成功')
      }
      
      setIsModalVisible(false)
      fetchBooks()
    } catch (error) {
      message.error(editingBook ? '更新图书失败' : '添加图书失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (book: Book) => {
    if (!book.book_id) return
    
    try {
      setLoading(true)
      await bookAPI.deleteBook(book.book_id)
      message.success('图书删除成功')
      fetchBooks()
    } catch (error) {
      message.error('删除图书失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (book: Book, newStatus: string) => {
    if (!book.book_id) return
    
    try {
      setLoading(true)
      await bookAPI.updateBookStatus(book.book_id, newStatus)
      message.success('状态更新成功')
      fetchBooks()
    } catch (error) {
      message.error('更新状态失败')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnsType<Book> = [
    {
      title: '图书ID',
      dataIndex: 'book_id',
      key: 'book_id',
      width: 80
    },
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
      width: 120,
      render: (status: string, record: Book) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record, value)}
          style={{ width: 80 }}
          size="small"
        >
          <Option value="在馆">在馆</Option>
          <Option value="借出">借出</Option>
          <Option value="修复">修复</Option>
          <Option value="遗失">遗失</Option>
        </Select>
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
      width: 120,
      render: (_, record: Book) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            修改
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>图书管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          添加图书
        </Button>
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
        title={editingBook ? '修改图书' : '添加图书'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ISBN"
            name="isbn"
            rules={[{ required: true, message: '请输入ISBN' }]}
          >
            <Input placeholder="请输入ISBN" disabled={!!editingBook} />
          </Form.Item>
          <Form.Item
            label="书名"
            name="title"
            rules={[{ required: true, message: '请输入书名' }]}
          >
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item
            label="作者"
            name="author"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="请输入作者" />
          </Form.Item>
          <Form.Item
            label="出版社"
            name="publisher"
          >
            <Input placeholder="请输入出版社" />
          </Form.Item>
          <Form.Item
            label="分类"
            name="category"
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="书架位置"
            name="location"
          >
            <Input placeholder="请输入书架位置" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}