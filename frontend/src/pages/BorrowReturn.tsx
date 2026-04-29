import React, { useState } from 'react'
import { Tabs, Form, Input, Button, Card, Table, message, Space, Tag, Modal } from 'antd'
import { Book } from '../types'
import { mockAPI } from '../services/mock'
import type { ColumnsType } from 'antd/es/table'

const { TabPane } = Tabs

interface BorrowRecordWithTitle {
  borrow_id: number
  reader_id: string
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

  const fetchBorrowRecords = async (readerId: string) => {
    if (!readerId) return
    try {
      const records = await mockAPI.getReaderBorrows(readerId)
      setBorrowRecords(records as BorrowRecordWithTitle[])
    } catch (error) {
      message.error('获取借阅记录失败')
    }
  }

  const handleBorrow = async (values: { readerId: string; isbn: string }) => {
    setLoading(true)
    try {
      const result = await mockAPI.borrow(values.readerId, values.isbn)
      Modal.success({
        title: '借书成功',
        content: (
          <div>
            <p>图书：{result.title}</p>
            <p>应还日期：{result.due_date}</p>
          </div>
        )
      })
      borrowForm.resetFields()
      setCurrentReaderId(values.readerId)
      fetchBorrowRecords(values.readerId)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '借书失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (values: { isbn: string }) => {
    setLoading(true)
    try {
      const result = await mockAPI.returnBook(values.isbn)
      if (result.fine > 0) {
        Modal.success({
          title: '还书成功',
          content: <p>逾期费用：¥{result.fine.toFixed(2)}</p>
        })
      } else {
        message.success('还书成功')
      }
      returnForm.resetFields()
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
              layout="inline"
              onFinish={handleBorrow}
            >
              <Form.Item
                name="readerId"
                label="读者证号"
                rules={[{ required: true, message: '请输入读者证号' }]}
              >
                <Input 
                  placeholder="请输入读者证号" 
                  style={{ width: 200 }}
                  onPressEnter={() => borrowForm.submit()}
                />
              </Form.Item>
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[{ required: true, message: '请输入ISBN' }]}
              >
                <Input 
                  placeholder="请输入图书ISBN" 
                  style={{ width: 200 }}
                  onPressEnter={() => borrowForm.submit()}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  借书
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="还书" key="return">
          <Card style={{ marginBottom: 16 }}>
            <Form
              form={returnForm}
              layout="inline"
              onFinish={handleReturn}
            >
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[{ required: true, message: '请输入ISBN' }]}
              >
                <Input 
                  placeholder="请输入图书ISBN或扫码" 
                  style={{ width: 300 }}
                  onPressEnter={() => returnForm.submit()}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  还书
                </Button>
              </Form.Item>
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
