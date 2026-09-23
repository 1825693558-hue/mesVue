<template>
  <div class="page-card">
    <div class="table-toolbar">
      <span style="font-weight: 700">工序报工</span>
      <el-button type="primary" @click="openDialog">提交报工</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="id" label="记录号" width="80" />
      <el-table-column label="派工单号" width="180">
        <template #default="{ row }">{{ dispatchMap[row.dispatchId] || ('#' + row.dispatchId) }}</template>
      </el-table-column>
      <el-table-column prop="operatorName" label="报工人" width="100" />
      <el-table-column prop="goodQty" label="合格数量" width="80" />
      <el-table-column prop="scrapQty" label="不良数量" width="80" />
      <el-table-column prop="reworkQty" label="返修数量" width="80" />
      <el-table-column prop="scrapReason" label="不良原因" width="120" />
      <el-table-column prop="reportTime" label="报工时间" width="160" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
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

    <el-dialog :close-on-click-modal="false" v-model="dialogVisible" title="提交报工" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="派工单" prop="dispatchId">
          <el-select v-model="form.dispatchId" placeholder="选择进行中的派工单" style="width: 100%" filterable>
            <el-option
              v-for="d in activeDispatches"
              :key="d.id"
              :label="d.dispatchNo + '（' + (d.stepName || '') + '）'"
              :value="d.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="合格数量" prop="goodQty">
          <el-input-number v-model="form.goodQty" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="不良数量">
          <el-input-number v-model="form.scrapQty" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="返修数量">
          <el-input-number v-model="form.reworkQty" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="不良原因">
          <el-select v-model="form.scrapReason" placeholder="选择不良原因" style="width: 100%">
            <el-option label="尺寸超差" value="尺寸超差" />
            <el-option label="外观缺陷" value="外观缺陷" />
            <el-option label="功能异常" value="功能异常" />
            <el-option label="材料缺陷" value="材料缺陷" />
            <el-option label="操作失误" value="操作失误" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReportList, submitReport, getDispatchList } from '../../api/order'

const loading = ref(false)
const submitting = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 20 })
const dialogVisible = ref(false)
const formRef = ref()
const activeDispatches = ref([])
const dispatchMap = ref({})
const form = reactive({
  dispatchId: null, goodQty: 0, scrapQty: 0, reworkQty: 0, scrapReason: '', remark: ''
})
const rules = {
  dispatchId: [{ required: true, message: '请选择派工单', trigger: 'change' }],
  goodQty: [{ required: true, message: '请输入合格数量', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getReportList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 加载进行中的派工单（供下拉），并构建 派工ID->派工单号 映射（供列表展示）
async function loadActiveDispatches() {
  const res = await getDispatchList({ status: 1, page: 1, size: 200 })
  activeDispatches.value = res.data.list || []
}

async function loadDispatchMap() {
  const res = await getDispatchList({ page: 1, size: 500 })
  const map = {}
  ;(res.data.list || []).forEach(d => { map[d.id] = d.dispatchNo })
  dispatchMap.value = map
}

function openDialog() {
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const res = await submitReport(form)
    ElMessage.success(`报工成功，订单进度：${res.data.orderProgress}%`)
    dialogVisible.value = false
    Object.assign(form, { dispatchId: null, goodQty: 0, scrapQty: 0, reworkQty: 0, scrapReason: '', remark: '' })
    await loadActiveDispatches()
    await loadDispatchMap()
    loadData()
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
  loadActiveDispatches()
  loadDispatchMap()
})
</script>
