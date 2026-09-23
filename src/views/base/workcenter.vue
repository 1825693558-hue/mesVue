<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.keyword" placeholder="中心编码/名称" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-select v-model="query.centerType" placeholder="中心类型" clearable style="width: 120px">
        <el-option label="加工" :value="1" />
        <el-option label="装配" :value="2" />
        <el-option label="检验" :value="3" />
        <el-option label="包装" :value="4" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增工作中心</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="centerCode" label="中心编码" width="140" />
      <el-table-column prop="centerName" label="中心名称" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag :type="centerTypeTag(row.centerType)" size="small">
            {{ centerTypeText(row.centerType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="capacityPerHour" label="小时产能" width="100" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '运行中' : '停机' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
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

    <el-dialog :close-on-click-modal="false" v-model="dialogVisible" :title="isEdit ? '编辑工作中心' : '新增工作中心'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="编码" prop="centerCode">
          <el-input v-model="form.centerCode" placeholder="如 WC-001" />
        </el-form-item>
        <el-form-item label="名称" prop="centerName">
          <el-input v-model="form.centerName" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.centerType">
            <el-radio :value="1">加工</el-radio>
            <el-radio :value="2">装配</el-radio>
            <el-radio :value="3">检验</el-radio>
            <el-radio :value="4">包装</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="小时产能">
          <el-input-number v-model="form.capacityPerHour" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getWorkCenterList, createWorkCenter, updateWorkCenter, deleteWorkCenter } from '../../api/base'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 20, keyword: '', centerType: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: null, centerCode: '', centerName: '', centerType: 1, capacityPerHour: 0, status: 1
})
const rules = {
  centerCode: [{ required: true, message: '请输入中心编码', trigger: 'blur' }],
  centerName: [{ required: true, message: '请输入中心名称', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getWorkCenterList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function centerTypeText(type) {
  return ['', '加工', '装配', '检验', '包装'][type] || '未知'
}

function centerTypeTag(type) {
  return ['', 'primary', 'warning', 'danger', 'info'][type] || 'info'
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, { id: null, centerCode: '', centerName: '', centerType: 1, capacityPerHour: 0, status: 1 })
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

async function handleSubmit() {
  await formRef.value.validate()
  if (isEdit.value) {
    await updateWorkCenter(form.id, form)
    ElMessage.success('修改成功')
  } else {
    await createWorkCenter(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id) {
  await deleteWorkCenter(id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
