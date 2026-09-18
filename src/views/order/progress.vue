<template>
  <div class="page-card">
    <el-page-header @back="$router.back()" content="订单进度详情" style="margin-bottom: 16px" />
    <el-descriptions :column="3" border style="margin-bottom: 16px">
      <el-descriptions-item label="订单号">{{ progress.orderNo }}</el-descriptions-item>
      <el-descriptions-item label="产品">{{ progress.productName }}</el-descriptions-item>
      <el-descriptions-item label="计划数量">{{ progress.plannedQty }}</el-descriptions-item>
      <el-descriptions-item label="完成数量">{{ progress.completedQty }}</el-descriptions-item>
      <el-descriptions-item label="不良数量">{{ progress.scrapQty }}</el-descriptions-item>
      <el-descriptions-item label="完成率">{{ progress.progress }}%</el-descriptions-item>
    </el-descriptions>

    <el-progress
      :percentage="progress.progress || 0"
      :stroke-width="20"
      :text-inside="true"
      style="margin-bottom: 16px"
    />

    <el-table :data="progress.dispatches || []" border>
      <el-table-column prop="dispatchNo" label="派工单号" width="180" />
      <el-table-column prop="stepName" label="工序" />
      <el-table-column prop="workCenterName" label="工作中心" />
      <el-table-column prop="operatorName" label="操作工" width="100" />
      <el-table-column prop="dispatchQty" label="派工数量" width="80" />
      <el-table-column prop="completedQty" label="完成数量" width="80" />
      <el-table-column prop="scrapQty" label="不良数量" width="80" />
      <el-table-column label="进度" width="150">
        <template #default="{ row }">
          <el-progress :percentage="row.progress" :stroke-width="12" :text-inside="true" />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="dispatchTag(row.status)" size="small">{{ row.statusText }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderProgress } from '../../api/order'

const route = useRoute()
const progress = ref({})

async function loadData() {
  const res = await getOrderProgress(route.params.id)
  progress.value = res.data
}

function dispatchTag(status) {
  return ['info', 'primary', 'warning', 'success'][status] || 'info'
}

onMounted(loadData)
</script>
