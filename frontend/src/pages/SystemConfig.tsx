import React, { useState, useEffect } from 'react'
import { Card, Form, InputNumber, Button, message, Descriptions } from 'antd'
import { SystemConfig as SystemConfigType } from '../types'
import { mockAPI } from '../services/mock'

export default function SystemConfig() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SystemConfigType | null>(null)
  const [form] = Form.useForm()

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await mockAPI.getAllConfigs()
      setConfig(data)
      form.setFieldsValue({
        maxBorrowCount: parseInt(data.max_borrow_count),
        borrowDays: parseInt(data.borrow_days),
        overdueFinePerDay: parseFloat(data.overdue_fine_per_day)
      })
    } catch (error) {
      message.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      
      await Promise.all([
        mockAPI.updateConfig('max_borrow_count', String(values.maxBorrowCount)),
        mockAPI.updateConfig('borrow_days', String(values.borrowDays)),
        mockAPI.updateConfig('overdue_fine_per_day', String(values.overdueFinePerDay))
      ])
      
      message.success('配置已生效')
      fetchConfig()
    } catch (error) {
      message.error('保存配置失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统配置</h2>
      
      <Card title="借阅规则配置" style={{ maxWidth: 600 }}>
        {config && (
          <Descriptions column={1} style={{ marginBottom: 24 }} size="small">
            <Descriptions.Item label="当前最大可借数量">{config.max_borrow_count} 本</Descriptions.Item>
            <Descriptions.Item label="当前借阅期限">{config.borrow_days} 天</Descriptions.Item>
            <Descriptions.Item label="当前逾期费用">¥{config.overdue_fine_per_day} / 天</Descriptions.Item>
          </Descriptions>
        )}
        
        <Form
          form={form}
          layout="vertical"
          loading={loading}
        >
          <Form.Item
            name="maxBorrowCount"
            label="最大可借数量"
            rules={[
              { required: true, message: '请输入最大可借数量' },
              { type: 'number', min: 1, message: '必须大于0' }
            ]}
            help="设置每位读者最多可同时借阅的图书数量"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入数量"
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="borrowDays"
            label="借阅期限（天）"
            rules={[
              { required: true, message: '请输入借阅期限' },
              { type: 'number', min: 1, message: '必须大于0' }
            ]}
            help="设置每本图书的借阅天数"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入天数"
              min={1}
            />
          </Form.Item>

          <Form.Item
            name="overdueFinePerDay"
            label="逾期费用（元/天）"
            rules={[
              { required: true, message: '请输入逾期费用' },
              { type: 'number', min: 0, message: '必须大于等于0' }
            ]}
            help="设置每天的逾期费用"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入费用"
              min={0}
              step={0.1}
              precision={2}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              onClick={handleSave}
              loading={saving}
              size="large"
              style={{ width: '100%' }}
            >
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
