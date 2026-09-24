<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.orderNo" placeholder="订单号" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-select v-model="query.status" placeholder="订单状态" clearable style="width: 120px">
        <el-option label="已创建" :value="0" />
        <el-option label="已下发" :value="1" />
        <el-option label="执行中" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已关闭" :value="4" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="dialogVisible = true">创建订单</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="orderNo" label="订单号" width="160" />
      <el-table-column label="产品" width="120">
        <template #default="{ row }">{{ getProductName(row.productId) }}</template>
      </el-table-column>
      <el-table-column prop="plannedQty" label="计划数量" width="80" />
      <el-table-column prop="completedQty" label="完成数量" width="80" />
      <el-table-column prop="scrapQty" label="不良数量" width="80" />
      <el-table-column label="进度" width="180">
        <template #default="{ row }">
          <el-progress
            :percentage="row.plannedQty > 0 ? Math.round(row.completedQty / row.plannedQty * 100) : 0"
            :stroke-width="14"
            :text-inside="true"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="plannedStartTime" label="计划开始" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 0" size="small" type="primary" @click="handleRelease(row.id)">下发</el-button>
          <el-button size="small" @click="$router.push(`/order/progress/${row.id}`)">进度</el-button>
          <el-button v-if="row.status === 3" size="small" type="warning" @click="handleClose(row.id)">关闭</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog :close-on-click-modal="false" v-model="dialogVisible" title="创建生产订单" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="产品" prop="productId">
          <el-select v-model="form.productId" placeholder="选择产品" style="width: 100%">
            <el-option v-for="p in products" :key="p.id" :label="p.productName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划数量" prop="plannedQty">
          <el-input-number v-model="form.plannedQty" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="form.priority" style="width: 100%">
            <el-option label="1-最高" :value="1" />
            <el-option label="2-高" :value="2" />
            <el-option label="3-中" :value="3" />
            <el-option label="4-低" :value="4" />
            <el-option label="5-最低" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划开始">
          <el-date-picker v-model="form.plannedStartTime" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="计划结束">
          <el-date-picker v-model="form.plannedEndTime" type="datetime" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, createOrder, releaseOrder, closeOrder } from '../../api/order'
import { getAllProducts } from '../../api/base'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const products = ref([])
const query = reactive({ page: 1, size: 20, orderNo: '', status: null })
const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  productId: null, plannedQty: 100, priority: 3,
  plannedStartTime: null, plannedEndTime: null
})
const rules = {
  productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
  plannedQty: [{ required: true, message: '请输入计划数量', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function getProductName(id) {
  const p = products.value.find(p => p.id === id)
  return p ? p.productName : '-'
}

function statusText(status) {
  return ['已创建', '已下发', '执行中', '已完成', '已关闭'][status] || '未知'
}

function statusTag(status) {
  return ['', 'primary', 'warning', 'success', 'info'][status] || 'info'
}

async function handleRelease(id) {
  await ElMessageBox.confirm('确认下发该订单？下发后将自动生成派工单。', '提示')
  await releaseOrder(id)
  ElMessage.success('下发成功，已生成派工单')
  loadData()
}

async function handleClose(id) {
  await ElMessageBox.confirm('确认关闭该订单？', '提示')
  await closeOrder(id)
  ElMessage.success('订单已关闭')
  loadData()
}

function formatDateTime(d) {
  const date = new Date(d)
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

async function handleCreate() {
  await formRef.value.validate()
  const data = { ...form }
  if (data.plannedStartTime) data.plannedStartTime = formatDateTime(data.plannedStartTime)
  if (data.plannedEndTime) data.plannedEndTime = formatDateTime(data.plannedEndTime)
  await createOrder(data)
  ElMessage.success('创建成功')
  dialogVisible.value = false
  loadData()
}

onMounted(async () => {
  loadData()
  const res = await getAllProducts()
  products.value = res.data
})
</script>
