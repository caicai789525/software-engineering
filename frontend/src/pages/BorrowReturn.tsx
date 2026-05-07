import React, { useState } from 'react'
import { Tabs, Form, Input, Button, Card, Table, message, Space, Tag, Modal, Select } from 'antd'
import { Book } from '../types'
import { borrowAPI, bookAPI, readerAPI } from '../services/api'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select

const { TabPane } = Tabs

interface BorrowRecordWithTitle {
  borrow_id: number
  reader_id: string
  book_id: number
  isbn: string
  title: string
  borrow_date: string
  due_date: string
  return_date?: string
  fine: number
}

export default function BorrowReturn() {
  const [activeTab, setActiveTab] = useState('borrow')
  const [borrowForm] = Form.useForm()
  const [returnForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecordWithTitle[]>([])
  const [currentReaderId, setCurrentReaderId] = useState<string>('')
  const [availableBooks, setAvailableBooks] = useState<Book[]>([])

  const fetchBorrowRecords = async (readerId: string) => {
    if (!readerId) return
    try {
      const records = await borrowAPI.getReaderBorrows(readerId)
      const recordsWithTitle = records.map(record => ({
        ...record,
        title: record.title || '未知书名'
      }))
      setBorrowRecords(recordsWithTitle as BorrowRecordWithTitle[])
    } catch (error) {
      message.error('获取借阅记录失败')
    }
  }

  const fetchAvailableBooks = async (keyword: string) => {
    if (!keyword) {
      setAvailableBooks([])
      return
    }
    try {
      const result = await bookAPI.getBooks({ keyword, status: '在馆', size: 20 })
      setAvailableBooks(result.list)
    } catch (error) {
      console.error('获取图书列表失败', error)
    }
  }

  const handleBorrow = async (values: { readerId: string; bookId: number }) => {
    setLoading(true)
    try {
      const book = availableBooks.find(b => b.book_id === values.bookId)
      const result = await borrowAPI.borrow(values.readerId, values.bookId)
      Modal.success({
        title: '借书成功',
        content: (
          <div>
            <p>图书：{book?.title || '未知书名'}</p>
            <p>应还日期：{result.due_date}</p>
          </div>
        )
      })
      borrowForm.resetFields()
      setAvailableBooks([])
      setCurrentReaderId(values.readerId)
      fetchBorrowRecords(values.readerId)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '借书失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (values: { bookId: number }) => {
    setLoading(true)
    try {
      const result = await borrowAPI.returnBook(values.bookId)
      if (result.fine > 0) {
        Modal.success({
          title: '还书成功',
          content: <p>逾期费用：¥{result.fine.toFixed(2)}</p>
        })
      } else {
        message.success('还书成功')
      }
      returnForm.resetFields()
      if (currentReaderId) {
        fetchBorrowRecords(currentReaderId)
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '还书失败')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnsType<BorrowRecordWithTitle> = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn'
    },
    {
      title: '书名',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '借阅日期',
      dataIndex: 'borrow_date',
      key: 'borrow_date'
    },
    {
      title: '应还日期',
      dataIndex: 'due_date',
      key: 'due_date'
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => (
        record.return_date ? 
          <Tag color="default">已归还</Tag> : 
          <Tag color="orange">借阅中</Tag>
      )
    }
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>借阅与归还</h2>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="借书" key="borrow">
          <Card style={{ marginBottom: 16 }}>
            <Form
              form={borrowForm}
              layout="vertical"
              onFinish={handleBorrow}
            >
              <Space wrap>
                <Form.Item
                  name="readerId"
                  label="读者证号"
                  rules={[{ required: true, message: '请输入读者证号' }]}
                  style={{ width: 250 }}
                >
                  <Input 
                    placeholder="请输入读者证号" 
                    onPressEnter={() => borrowForm.submit()}
                  />
                </Form.Item>
                <Form.Item
                  name="bookKeyword"
                  label="图书搜索"
                  style={{ width: 300 }}
                >
                  <Input 
                    placeholder="搜索书名、作者或ISBN" 
                    onChange={(e) => fetchAvailableBooks(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="bookId"
                  label="选择图书"
                  rules={[{ required: true, message: '请选择图书' }]}
                  style={{ width: 350 }}
                >
                  <Select placeholder="请选择要借阅的图书">
                    {availableBooks.map(book => (
                      <Option key={book.book_id} value={book.book_id}>
                        {book.title} - {book.author} (ISBN: {book.isbn})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item style={{ marginTop: 24 }}>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    借书
                  </Button>
                </Form.Item>
              </Space>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="还书" key="return">
          <Card style={{ marginBottom: 16 }}>
            <Form
              form={returnForm}
              layout="vertical"
              onFinish={handleReturn}
            >
              <Space wrap>
                <Form.Item
                  name="readerId"
                  label="读者证号"
                  rules={[{ required: true, message: '请输入读者证号' }]}
                  style={{ width: 250 }}
                >
                  <Input 
                    placeholder="请输入读者证号" 
                    onChange={(e) => {
                      setCurrentReaderId(e.target.value)
                      if (e.target.value) {
                        fetchBorrowRecords(e.target.value)
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="bookId"
                  label="选择图书"
                  rules={[{ required: true, message: '请选择要归还的图书' }]}
                  style={{ width: 350 }}
                >
                  <Select placeholder="请选择要归还的图书">
                    {borrowRecords
                      .filter(r => !r.return_date)
                      .map(record => (
                        <Option key={record.book_id} value={record.book_id}>
                          {record.title} (ISBN: {record.isbn})
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                <Form.Item style={{ marginTop: 24 }}>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    还书
                  </Button>
                </Form.Item>
              </Space>
            </Form>
          </Card>
        </TabPane>
      </Tabs>

      {currentReaderId && (
        <Card title="当前读者借阅列表">
          <Table
            columns={columns}
            dataSource={borrowRecords}
            rowKey="borrow_id"
            pagination={false}
            locale={{
              emptyText: '该读者暂无借阅记录'
            }}
          />
        </Card>
      )}
    </div>
  )
}
