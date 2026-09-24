<template>
  <div class="page-card">
    <div class="search-bar">
      <el-select v-model="query.orderId" placeholder="选择订单" clearable filterable style="width: 220px">
        <el-option v-for="o in orders" :key="o.id" :label="o.orderNo" :value="o.id" />
      </el-select>
      <el-input v-model="query.workCenterId" placeholder="工作中心ID" clearable style="width: 120px" />
      <el-select v-model="query.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="待开工" :value="0" />
        <el-option label="进行中" :value="1" />
        <el-option label="已暂停" :value="2" />
        <el-option label="已完成" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="dispatchNo" label="派工单号" width="180" />
      <el-table-column prop="orderNo" label="订单号" width="150" />
      <el-table-column prop="stepName" label="工序" width="120" />
      <el-table-column prop="workCenterName" label="工作中心" width="130" />
      <el-table-column label="操作工" width="100">
        <template #default="{ row }">{{ row.operatorName || '未指派' }}</template>
      </el-table-column>
      <el-table-column prop="dispatchQty" label="派工数量" width="80" />
      <el-table-column prop="completedQty" label="完成数量" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 0 || row.status === 2" size="small" type="primary" @click="handleStart(row.id)">开始</el-button>
          <el-button v-if="row.status === 1" size="small" type="warning" @click="handlePause(row.id)">暂停</el-button>
          <el-button v-if="row.status === 1" size="small" type="success" @click="handleComplete(row.id)">完成</el-button>
          <el-button size="small" @click="openAssign(row)">指派</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
      />
    </div>

    <el-dialog :close-on-click-modal="false" v-model="assignVisible" title="指派操作工" width="400px">
      <el-form label-width="80px">
        <el-form-item label="操作工">
          <el-select v-model="assignOperatorId" placeholder="选择操作工" style="width: 100%">
            <el-option
              v-for="u in operators"
              :key="u.id"
              :label="u.realName + '（' + u.username + '）'"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssign">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDispatchList, startDispatch, pauseDispatch, completeDispatch, assignOperator, getOrderList } from '../../api/order'
import { getUserList } from '../../api/system'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const orders = ref([])
const query = reactive({ page: 1, size: 20, orderId: null, workCenterId: null, status: null })
const assignVisible = ref(false)
const assignRow = ref(null)
const assignOperatorId = ref(null)
const operators = ref([])

async function loadData() {
  loading.value = true
  try {
    const res = await getDispatchList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  const res = await getOrderList({ page: 1, size: 100 })
  orders.value = res.data.list || []
}

async function loadOperators() {
  const res = await getUserList({ page: 1, size: 100 })
  operators.value = res.data.list || []
}

function statusText(status) {
  return ['待开工', '进行中', '已暂停', '已完成'][status] || '未知'
}

function statusTag(status) {
  return ['info', 'primary', 'warning', 'success'][status] || 'info'
}

async function handleStart(id) {
  await startDispatch(id)
  ElMessage.success('已开始作业')
  loadData()
}

async function handlePause(id) {
  await pauseDispatch(id)
  ElMessage.success('已暂停')
  loadData()
}

async function handleComplete(id) {
  await completeDispatch(id)
  ElMessage.success('派工单已完成')
  loadData()
}

function openAssign(row) {
  assignRow.value = row
  assignOperatorId.value = null
  assignVisible.value = true
}

async function handleAssign() {
  await assignOperator(assignRow.value.id, assignOperatorId.value)
  ElMessage.success('指派成功')
  assignVisible.value = false
  loadData()
}

onMounted(() => {
  loadData()
  loadOrders()
  loadOperators()
})
</script>
