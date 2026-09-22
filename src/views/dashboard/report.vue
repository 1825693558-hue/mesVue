<template>
  <div class="page-card">
    <div class="search-bar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 300px"
      />
      <el-button type="primary" @click="loadAll">查询</el-button>
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="12">
        <div class="chart-container">
          <div style="font-weight: 700; margin-bottom: 12px">生产日报</div>
          <div ref="productionChartRef" style="width: 100%; height: 300px" />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="chart-container">
          <div style="font-weight: 700; margin-bottom: 12px">质量分析</div>
          <div ref="qualityChartRef" style="width: 100%; height: 300px" />
        </div>
      </el-col>
    </el-row>

    <div class="chart-container">
      <div style="font-weight: 700; margin-bottom: 12px">OEE分析</div>
      <div ref="oeeChartRef" style="width: 100%; height: 320px" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getProductionDaily, getQualityAnalysis, getOeeAnalysis } from '../../api/dashboard'

const dateRange = ref([])
const productionChartRef = ref(null)
const qualityChartRef = ref(null)
const oeeChartRef = ref(null)

let productionChart = null
let qualityChart = null
let oeeChart = null

async function loadProduction() {
  const date = dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : ''
  const res = await getProductionDaily(date)
  // 后端返回 { date, totalGoodQty, totalScrapQty, reportCount, details:[{dispatchId,goodQty,scrapQty}] }
  const data = (res.data && res.data.details) || []
  productionChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['合格数量', '不良数量'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => '派工#' + d.dispatchId) },
    yAxis: { type: 'value' },
    series: [
      { name: '合格数量', type: 'bar', data: data.map(d => d.goodQty) },
      { name: '不良数量', type: 'bar', data: data.map(d => d.scrapQty) }
    ]
  })
}

async function loadQuality() {
  const startDate = dateRange.value && dateRange.value.length === 2 ? dateRange.value[0] : ''
  const endDate = dateRange.value && dateRange.value.length === 2 ? dateRange.value[1] : ''
  const res = await getQualityAnalysis(startDate, endDate)
  // 后端返回 { totalGoodQty, totalScrapQty, scrapReasonDistribution:{reason:qty} }
  const dist = (res.data && res.data.scrapReasonDistribution) || {}
  const data = Object.keys(dist).map(reason => ({ name: reason, value: dist[reason] }))
  qualityChart.setOption({
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '不良原因',
        type: 'pie',
        radius: '60%',
        data: data,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
      }
    ]
  })
}

async function loadOee() {
  const res = await getOeeAnalysis()
  // 后端返回 { workCenters:[{workCenterName,availability,performance,quality,oee}] }
  const data = (res.data && res.data.workCenters) || []
  const workCenters = data.map(d => d.workCenterName)
  oeeChart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['可用率', '性能率', '质量率', 'OEE'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: workCenters },
    yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
    series: [
      { name: '可用率', type: 'bar', data: data.map(d => d.availability) },
      { name: '性能率', type: 'bar', data: data.map(d => d.performance) },
      { name: '质量率', type: 'bar', data: data.map(d => d.quality) },
      { name: 'OEE', type: 'bar', data: data.map(d => d.oee) }
    ]
  })
}

async function loadAll() {
  await Promise.all([loadProduction(), loadQuality(), loadOee()])
}

function resizeCharts() {
  productionChart && productionChart.resize()
  qualityChart && qualityChart.resize()
  oeeChart && oeeChart.resize()
}

onMounted(async () => {
  await nextTick()
  productionChart = echarts.init(productionChartRef.value)
  qualityChart = echarts.init(qualityChartRef.value)
  oeeChart = echarts.init(oeeChartRef.value)
  window.addEventListener('resize', resizeCharts)
  loadAll()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  productionChart && productionChart.dispose()
  qualityChart && qualityChart.dispose()
  oeeChart && oeeChart.dispose()
})
</script>
