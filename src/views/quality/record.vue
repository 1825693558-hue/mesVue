<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.dispatchId" placeholder="派工单ID" clearable style="width: 140px" @keyup.enter="loadData" />
      <el-select v-model="query.checkType" placeholder="检验类型" clearable style="width: 120px">
        <el-option label="首检" :value="1" />
        <el-option label="巡检" :value="2" />
        <el-option label="末检" :value="3" />
      </el-select>
      <el-select v-model="query.result" placeholder="检验结果" clearable style="width: 120px">
        <el-option label="合格" :value="1" />
        <el-option label="不合格" :value="2" />
        <el-option label="让步接收" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增检验记录</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="dispatchId" label="派工单ID" width="100" />
      <el-table-column prop="inspectorId" label="检验人ID" width="100" />
      <el-table-column label="检验类型" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ checkTypeText(row.checkType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="检验结果" width="100">
        <template #default="{ row }">
          <el-tag :type="resultTag(row.result)" size="small">{{ resultText(row.result) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sampleQty" label="抽样数量" width="90" />
      <el-table-column prop="defectQty" label="不良数量" width="90" />
      <el-table-column prop="defectDesc" label="不良描述" show-overflow-tooltip />
      <el-table-column prop="checkTime" label="检验时间" width="160" />
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="新增检验记录" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="派工单ID" prop="dispatchId">
          <el-input-number v-model="form.dispatchId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="检验人ID" prop="inspectorId">
          <el-input-number v-model="form.inspectorId" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="检验类型" prop="checkType">
          <el-radio-group v-model="form.checkType">
            <el-radio :value="1">首检</el-radio>
            <el-radio :value="2">巡检</el-radio>
            <el-radio :value="3">末检</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="检验结果" prop="result">
          <el-radio-group v-model="form.result">
            <el-radio :value="1">合格</el-radio>
            <el-radio :value="2">不合格</el-radio>
            <el-radio :value="3">让步接收</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="抽样数量" prop="sampleQty">
          <el-input-number v-model="form.sampleQty" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="不良数量">
          <el-input-number v-model="form.defectQty" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="不良描述">
          <el-input v-model="form.defectDesc" type="textarea" :rows="2" />
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
import { getQualityList, createQualityRecord } from '../../api/order'

const loading = ref(false)
const submitting = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 20, dispatchId: null, checkType: null, result: null })

const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  dispatchId: null, inspectorId: null, checkType: 1, result: 1,
  sampleQty: 0, defectQty: 0, defectDesc: ''
})
const rules = {
  dispatchId: [{ required: true, message: '请输入派工单ID', trigger: 'blur' }],
  inspectorId: [{ required: true, message: '请输入检验人ID', trigger: 'blur' }],
  checkType: [{ required: true, message: '请选择检验类型', trigger: 'change' }],
  result: [{ required: true, message: '请选择检验结果', trigger: 'change' }],
  sampleQty: [{ required: true, message: '请输入抽样数量', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getQualityList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function checkTypeText(type) {
  return ['', '首检', '巡检', '末检'][type] || '未知'
}

function resultText(result) {
  return ['', '合格', '不合格', '让步接收'][result] || '未知'
}

function resultTag(result) {
  return ['', 'success', 'danger', 'warning'][result] || 'info'
}

function handleAdd() {
  Object.assign(form, {
    dispatchId: null, inspectorId: null, checkType: 1, result: 1,
    sampleQty: 0, defectQty: 0, defectDesc: ''
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    await createQualityRecord(form)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadData()
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>
