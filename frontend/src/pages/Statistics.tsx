import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, DatePicker, Button, Table, message, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { mockAPI } from '../services/mock'
import { BorrowRankItem, CategoryStatItem, OverdueItem, MonthlyStatItem } from '../types'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function Statistics() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>()
  const [borrowRank, setBorrowRank] = useState<BorrowRankItem[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStatItem[]>([])
  const [overdueStats, setOverdueStats] = useState<OverdueItem[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatItem[]>([])
  const chartsRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    try {
      const [rank, category, overdue, monthly] = await Promise.all([
        mockAPI.getBorrowRank(),
        mockAPI.getCategoryStats(),
        mockAPI.getOverdueStats(),
        mockAPI.getMonthlyStats()
      ])
      setBorrowRank(rank)
      setCategoryStats(category)
      setOverdueStats(overdue)
      setMonthlyStats(monthly)
    } catch (error) {
      message.error('获取统计数据失败')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const borrowRankOption = {
    title: { text: '借阅排行榜 TOP10', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: borrowRank.map(item => item.title).reverse()
    },
    series: [{
      type: 'bar',
      data: borrowRank.map(item => item.count).reverse(),
      itemStyle: { color: '#1890ff' }
    }]
  }

  const categoryOption = {
    title: { text: '分类借阅统计', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: categoryStats.map(item => ({
        value: item.count,
        name: item.category
      }))
    }]
  }

  const monthlyOption = {
    title: { text: '月度借阅量', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: monthlyStats.map(item => item.month)
    },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: monthlyStats.map(item => item.count),
      smooth: true,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#52c41a' }
    }]
  }

  const overdueColumns: ColumnsType<OverdueItem> = [
    { title: '读者证号', dataIndex: 'reader_id', key: 'reader_id' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '书名', dataIndex: 'title', key: 'title' },
    { title: '应还日期', dataIndex: 'due_date', key: 'due_date' },
    { title: '逾期天数', dataIndex: 'overdue_days', key: 'overdue_days' },
    { title: '逾期费用(元)', dataIndex: 'fine', key: 'fine', render: (fine: number) => fine.toFixed(2) }
  ]

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(overdueStats)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '逾期统计')
    XLSX.writeFile(workbook, '逾期统计.xlsx')
  }

  const exportCharts = async () => {
    if (!chartsRef) return
    try {
      const canvas = await html2canvas(chartsRef)
      const link = document.createElement('a')
      link.download = '统计图表.png'
      link.href = canvas.toDataURL()
      link.click()
      message.success('图表导出成功')
    } catch (error) {
      message.error('图表导出失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>统计报表</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 300 }}
          />
          <Button icon={<DownloadOutlined />} onClick={exportExcel}>
            导出Excel
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCharts}>
            导出图表
          </Button>
        </Space>
      </div>

      <div ref={chartsRef}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card>
              <ReactECharts option={borrowRankOption} style={{ height: 400 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <ReactECharts option={categoryOption} style={{ height: 400 }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>
              <ReactECharts option={monthlyOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>
      </div>

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="逾期统计">
            <Table
              columns={overdueColumns}
              dataSource={overdueStats}
              rowKey="reader_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
