import React, { useState, useEffect, useCallback } from 'react'
import { Table, Input, Button, Space, Modal, Form, message, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { Reader } from '../types'
import { mockAPI } from '../services/mock'
import type { ColumnsType } from 'antd/es/table'

export default function Readers() {
  const [loading, setLoading] = useState(false)
  const [readers, setReaders] = useState<Reader[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReader, setEditingReader] = useState<Reader | null>(null)
  const [form] = Form.useForm()

  const fetchReaders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await mockAPI.getReaders({
        keyword,
        page,
        size: pageSize
      })
      setReaders(result.list)
      setTotal(result.total)
    } catch (error) {
      message.error('获取读者列表失败')
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    fetchReaders()
  }, [fetchReaders])

  const handleAdd = () => {
    setEditingReader(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (reader: Reader) => {
    setEditingReader(reader)
    form.setFieldsValue(reader)
    setIsModalOpen(true)
  }

  const handleDelete = async (readerId: string) => {
    try {
      await mockAPI.deleteReader(readerId)
      message.success('删除成功')
      fetchReaders()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleToggleStatus = async (reader: Reader) => {
    try {
      const newStatus = reader.status === '正常' ? '注销' : '正常'
      await mockAPI.updateReaderStatus(reader.reader_id, newStatus)
      message.success('状态更新成功')
      fetchReaders()
    } catch (error) {
      message.error('状态更新失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingReader) {
        await mockAPI.updateReader(editingReader.reader_id, values)
        message.success('更新成功')
      } else {
        await mockAPI.createReader(values)
        message.success('添加成功')
      }
      setIsModalOpen(false)
      fetchReaders()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns: ColumnsType<Reader> = [
    {
      title: '读者证号',
      dataIndex: 'reader_id',
      key: 'reader_id',
      width: 150
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '注册日期',
      dataIndex: 'reg_date',
      key: 'reg_date',
      render: (date: string) => date.split('T')[0]
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '正常' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === '正常' ? '注销' : '恢复'}
          </Button>
          <Popconfirm
            title="确定要删除该读者吗？"
            onConfirm={() => handleDelete(record.reader_id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>读者管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加读者
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索姓名或读者证号"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onChange={(e) => {
            setKeyword(e.target.value)
            setPage(1)
          }}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={readers}
        rowKey="reader_id"
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
      />

      <Modal
        title={editingReader ? '编辑读者' : '添加读者'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' }
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[
              { required: true, message: '请输入电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
