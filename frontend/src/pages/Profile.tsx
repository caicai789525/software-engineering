import React, { useState, useEffect, useCallback } from 'react'
import { Table, Tag, Card, Statistic, Row, Col, message, Button } from 'antd'
import { BookOutlined, ClockCircleOutlined, ExclamationCircleOutlined, HistoryOutlined, RotateLeftOutlined } from '@ant-design/icons'
import { Reader, BorrowRecord } from '../types'
import { readerAPI, borrowAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { ColumnsType } from 'antd/es/table'

const statusColorMap: Record<string, string> = {
  '在馆': 'green',
  '借出': 'red',
  '修复': 'orange',
  '遗失': 'default'
}

export default function Profile() {
  const { username } = useAuth()
  const readerId = username || ''
  const [loading, setLoading] = useState(false)
  const [reader, setReader] = useState<Reader | null>(null)
  const [activeBorrows, setActiveBorrows] = useState<BorrowRecord[]>([])
  const [historyBorrows, setHistoryBorrows] = useState<BorrowRecord[]>([])
  const [activeCount, setActiveCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)
  const [totalBorrowed, setTotalBorrowed] = useState(0)
  const [totalFine, setTotalFine] = useState(0)

  const fetchReaderInfo = useCallback(async () => {
    setLoading(true)
    try {
      const result = await readerAPI.getReader(readerId)
      setReader(result)
    } catch (error) {
      message.error('获取读者信息失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActiveBorrows = useCallback(async () => {
    setLoading(true)
    try {
      const result = await borrowAPI.getActiveBorrows(readerId)
      setActiveBorrows(result)
      setActiveCount(result.length)
      
      const overdue = result.filter(r => {
        const dueDate = new Date(r.due_date)
        return new Date() > dueDate
      }).length
      setOverdueCount(overdue)
    } catch (error) {
      message.error('获取借阅记录失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistoryBorrows = useCallback(async () => {
    setLoading(true)
    try {
      const result = await borrowAPI.getHistoryBorrows(readerId)
      setHistoryBorrows(result)
      setTotalBorrowed(result.length)
      
      const total = result.reduce((sum, r) => sum + (r.fine || 0), 0)
      setTotalFine(total)
    } catch (error) {
      message.error('获取历史记录失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleReturn = async (borrow: BorrowRecord) => {
    if (!borrow.book_id) return
    
    try {
      setLoading(true)
      await borrowAPI.returnBook({ book_id: borrow.book_id })
      message.success('归还成功')
      fetchActiveBorrows()
      fetchHistoryBorrows()
    } catch (error) {
      message.error('归还失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReaderInfo()
    fetchActiveBorrows()
    fetchHistoryBorrows()
  }, [fetchReaderInfo, fetchActiveBorrows, fetchHistoryBorrows])

  const activeColumns: ColumnsType<BorrowRecord> = [
    {
      title: '图书名称',
      dataIndex: 'book_title',
      key: 'book_title'
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 180
    },
    {
      title: '借阅日期',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
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
      title: '应还日期',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date: string, record: BorrowRecord) => {
        if (date) {
          const d = new Date(date)
          const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          if (new Date() > d) {
            return <Tag color="red">{formatted} (已逾期)</Tag>
          }
          return formatted
        }
        return '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record: BorrowRecord) => (
        <Button
          type="primary"
          icon={<RotateLeftOutlined />}
          onClick={() => handleReturn(record)}
          size="small"
        >
          归还
        </Button>
      )
    }
  ]

  const historyColumns: ColumnsType<BorrowRecord> = [
    {
      title: '图书名称',
      dataIndex: 'book_title',
      key: 'book_title'
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 180
    },
    {
      title: '借阅日期',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
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
      title: '归还日期',
      dataIndex: 'return_date',
      key: 'return_date',
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
      title: '逾期费用',
      dataIndex: 'fine',
      key: 'fine',
      width: 100,
      render: (fine: number) => `${fine.toFixed(2)} 元`
    }
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>加载中...</div>
  }

  return (
    <div>
      <h2>个人中心</h2>
      
      {reader && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24 }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{reader.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>{reader.name}</h3>
              <p style={{ margin: 0, color: '#666' }}>读者证号: {reader.reader_id}</p>
              <p style={{ margin: 0, color: '#666' }}>联系电话: {reader.phone}</p>
              <p style={{ margin: 0, color: '#666' }}>注册日期: {reader.register_date}</p>
            </div>
          </div>
        </Card>
      )}

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="当前借阅"
              value={activeCount}
              prefix={<BookOutlined />}
              suffix="本"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="逾期数量"
              value={overdueCount}
              prefix={<ExclamationCircleOutlined />}
              suffix="本"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计借阅"
              value={totalBorrowed}
              prefix={<HistoryOutlined />}
              suffix="本"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="累计欠费"
              value={totalFine.toFixed(2)}
              prefix={<ClockCircleOutlined />}
              suffix="元"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="当前借阅" style={{ marginBottom: 24 }}>
        <Table
          columns={activeColumns}
          dataSource={activeBorrows}
          rowKey="borrow_id"
          pagination={false}
          locale={{
            emptyText: '暂无借阅记录'
          }}
        />
      </Card>

      <Card title="借阅历史">
        <Table
          columns={historyColumns}
          dataSource={historyBorrows}
          rowKey="borrow_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          locale={{
            emptyText: '暂无借阅历史'
          }}
        />
      </Card>
    </div>
  )
}