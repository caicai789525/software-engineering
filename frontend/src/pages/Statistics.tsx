import React, { useState, useEffect, useRef } from 'react'
import { Card, Row, Col, DatePicker, Button, Table, message, Space, Empty } from 'antd'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { statisticsAPI } from '../services/api'
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
  const [loading, setLoading] = useState(false)
  const chartsRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = {} as { start_date?: string; end_date?: string }
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].format('YYYY-MM-DD')
        params.end_date = dateRange[1].format('YYYY-MM-DD')
      }

      const [rank, category, overdue, monthly] = await Promise.all([
        statisticsAPI.getBorrowRank({ ...params, limit: 10 }),
        statisticsAPI.getCategoryStats(params),
        statisticsAPI.getOverdueStats(params),
        statisticsAPI.getMonthlyStats({ year: new Date().getFullYear() })
      ])
      setBorrowRank(rank || [])
      setCategoryStats(category || [])
      setOverdueStats(overdue || [])
      setMonthlyStats(monthly || [])
      message.success('统计数据更新成功')
    } catch (error) {
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
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
    { title: '逾期费用(元)', dataIndex: 'fine', key: 'fine', render: (fine: number) => fine?.toFixed(2) || '0.00' }
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
      const canvas = await html2canvas(chartsRef.current!)
      const link = document.createElement('a')
      link.download = '统计图表.png'
      link.href = canvas.toDataURL()
      link.click()
      message.success('图表导出成功')
    } catch (error) {
      message.error('图表导出失败')
    }
  }

  const hasData = borrowRank.length > 0 || categoryStats.length > 0 || monthlyStats.length > 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>统计报表</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 300 }}
            placeholder={['开始日期', '结束日期']}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            刷新数据
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportExcel}>
            导出Excel
          </Button>
          <Button icon={<DownloadOutlined />} onClick={exportCharts}>
            导出图表
          </Button>
        </Space>
      </div>

      {hasData ? (
        <div ref={chartsRef}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card>
                {borrowRank.length > 0 ? (
                  <ReactECharts option={borrowRankOption} style={{ height: 400 }} />
                ) : (
                  <Empty description="暂无借阅数据" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                )}
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                {categoryStats.length > 0 ? (
                  <ReactECharts option={categoryOption} style={{ height: 400 }} />
                ) : (
                  <Empty description="暂无分类数据" style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <Card>
                {monthlyStats.length > 0 ? (
                  <ReactECharts option={monthlyOption} style={{ height: 350 }} />
                ) : (
                  <Empty description="暂无月度数据" style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <Card>
          <Empty description="暂无统计数据，请先添加借阅记录" style={{ padding: '50px 0' }} />
        </Card>
      )}

      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="逾期统计">
            <Table
              columns={overdueColumns}
              dataSource={overdueStats}
              rowKey="reader_id"
              pagination={false}
              locale={{
                emptyText: '暂无逾期记录'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}