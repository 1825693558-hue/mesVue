<template>
  <div>
    <!-- Stat cards -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">当日计划数量</div>
          <div class="stat-value">{{ overview.plannedQty || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">当日完成数量</div>
          <div class="stat-value" style="color: #059669">{{ overview.completedQty || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">完成率</div>
          <div class="stat-value" style="color: #1a56db">{{ overview.completionRate || 0 }}%</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">不良率</div>
          <div class="stat-value" style="color: #dc2626">{{ overview.scrapRate || 0 }}%</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- Work Center Status -->
      <el-col :span="12">
        <div class="chart-container" style="margin-bottom: 16px">
          <div style="font-weight: 700; margin-bottom: 12px">工作中心状态</div>
          <el-table :data="workCenterStatus" size="small" border>
            <el-table-column prop="workCenterName" label="工作中心" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="activeDispatchCount" label="在制任务" width="80" />
            <el-table-column label="设备" width="100">
              <template #default="{ row }">
                {{ row.runningEquipmentCount }}/{{ row.equipmentCount }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- Order Progress -->
      <el-col :span="12">
        <div class="chart-container" style="margin-bottom: 16px">
          <div style="font-weight: 700; margin-bottom: 12px">执行中订单进度</div>
          <el-table :data="orderProgress" size="small" border>
            <el-table-column prop="orderNo" label="订单号" width="140" />
            <el-table-column prop="productName" label="产品" />
            <el-table-column label="进度" width="180">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.progress"
                  :stroke-width="14"
                  :text-inside="true"
                />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ row.statusText }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <!-- Alerts -->
    <div class="chart-container" style="margin-top: 16px">
      <div style="font-weight: 700; margin-bottom: 12px">异常预警</div>
      <el-empty v-if="alerts.length === 0" description="暂无异常" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="(alert, idx) in alerts"
          :key="idx"
          :type="alert.level === 'danger' ? 'danger' : 'warning'"
          :timestamp="alert.type"
        >
          {{ alert.message }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getOverview, getWorkCenterStatus, getOrderProgress, getAlerts } from '../../api/dashboard'

const overview = ref({})
const workCenterStatus = ref([])
const orderProgress = ref([])
const alerts = ref([])

let timer = null

async function refreshData() {
  try {
    const [o, wc, op, al] = await Promise.all([
      getOverview(),
      getWorkCenterStatus(),
      getOrderProgress(),
      getAlerts()
    ])
    overview.value = o.data
    workCenterStatus.value = wc.data
    orderProgress.value = op.data
    alerts.value = al.data
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  refreshData()
  timer = setInterval(refreshData, 30000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
