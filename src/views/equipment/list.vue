<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.keyword" placeholder="设备编码/名称" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-select v-model="query.equipmentType" placeholder="设备类型" clearable style="width: 120px">
        <el-option label="CNC" :value="1" />
        <el-option label="注塑机" :value="2" />
        <el-option label="检测仪" :value="3" />
        <el-option label="传输带" :value="4" />
      </el-select>
      <el-select v-model="query.status" placeholder="状态" clearable style="width: 120px">
        <el-option label="空闲" :value="0" />
        <el-option label="运行" :value="1" />
        <el-option label="停机" :value="2" />
        <el-option label="维修" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增设备</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="equipmentCode" label="设备编码" width="140" />
      <el-table-column prop="equipmentName" label="设备名称" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ equipmentTypeText(row.equipmentType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="所属工作中心" width="140">
        <template #default="{ row }">
          {{ getWorkCenterName(row.workCenterId) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="purchaseDate" label="购入日期" width="120" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-dropdown style="margin: 0 8px" @command="(cmd) => handleStatusChange(row.id, cmd)">
            <el-button size="small" type="warning">变更状态</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="0">空闲</el-dropdown-item>
                <el-dropdown-item :command="1">运行</el-dropdown-item>
                <el-dropdown-item :command="2">停机</el-dropdown-item>
                <el-dropdown-item :command="3">维修</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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

    <el-dialog :close-on-click-modal="false" v-model="dialogVisible" :title="isEdit ? '编辑设备' : '新增设备'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="设备编码" prop="equipmentCode">
          <el-input v-model="form.equipmentCode" placeholder="如 EQ-001" />
        </el-form-item>
        <el-form-item label="设备名称" prop="equipmentName">
          <el-input v-model="form.equipmentName" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-radio-group v-model="form.equipmentType">
            <el-radio :value="1">CNC</el-radio>
            <el-radio :value="2">注塑机</el-radio>
            <el-radio :value="3">检测仪</el-radio>
            <el-radio :value="4">传输带</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="工作中心">
          <el-select v-model="form.workCenterId" placeholder="选择工作中心" clearable style="width: 100%">
            <el-option v-for="wc in workCenters" :key="wc.id" :label="wc.centerName" :value="wc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="购入日期">
          <el-date-picker v-model="form.purchaseDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="空闲" :value="0" />
            <el-option label="运行" :value="1" />
            <el-option label="停机" :value="2" />
            <el-option label="维修" :value="3" />
          </el-select>
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
import {
  getEquipmentList, createEquipment, updateEquipment,
  changeEquipmentStatus, deleteEquipment
} from '../../api/base'
import { getAllWorkCenters } from '../../api/base'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const workCenters = ref([])
const query = reactive({ page: 1, size: 20, keyword: '', equipmentType: null, status: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: null, equipmentCode: '', equipmentName: '', equipmentType: 1,
  workCenterId: null, status: 0, purchaseDate: ''
})
const rules = {
  equipmentCode: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
  equipmentName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getEquipmentList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function getWorkCenterName(id) {
  const wc = workCenters.value.find(w => w.id === id)
  return wc ? wc.centerName : '-'
}

function equipmentTypeText(type) {
  return ['', 'CNC', '注塑机', '检测仪', '传输带'][type] || '未知'
}

function statusText(status) {
  return ['空闲', '运行', '停机', '维修'][status] || '未知'
}

function statusTag(status) {
  return ['info', 'success', 'danger', 'warning'][status] || 'info'
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, {
    id: null, equipmentCode: '', equipmentName: '', equipmentType: 1,
    workCenterId: null, status: 0, purchaseDate: ''
  })
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
    await updateEquipment(form.id, form)
    ElMessage.success('修改成功')
  } else {
    await createEquipment(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

async function handleStatusChange(id, status) {
  await changeEquipmentStatus(id, status)
  ElMessage.success('状态变更成功')
  loadData()
}

async function handleDelete(id) {
  await deleteEquipment(id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(async () => {
  loadData()
  const res = await getAllWorkCenters()
  workCenters.value = res.data
})
</script>
