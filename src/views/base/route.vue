<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.keyword" placeholder="路线编码/名称" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAddRoute">新增工艺路线</el-button>
    </div>

    <el-table
      :data="list"
      v-loading="loading"
      border
      highlight-current-row
      @row-click="handleRouteClick"
    >
      <el-table-column prop="routeCode" label="路线编码" width="140" />
      <el-table-column prop="routeName" label="路线名称" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click.stop="handleEditRoute(row)">编辑</el-button>
          <el-button size="small" type="primary" @click.stop="handleRouteClick(row)">工序</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDeleteRoute(row.id)">
            <template #reference>
              <el-button size="small" type="danger" @click.stop>删除</el-button>
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

    <!-- Steps section -->
    <div v-if="currentRoute" style="margin-top: 24px">
      <div class="table-toolbar">
        <span style="font-weight: 700">工序步骤 - {{ currentRoute.routeName }}</span>
        <el-button type="primary" @click="handleAddStep">新增步骤</el-button>
      </div>

      <el-table :data="stepList" v-loading="stepLoading" border>
        <el-table-column prop="stepNo" label="步骤号" width="80" />
        <el-table-column prop="stepName" label="工序名称" />
        <el-table-column label="工作中心" width="140">
          <template #default="{ row }">
            {{ getWorkCenterName(row.workCenterId) }}
          </template>
        </el-table-column>
        <el-table-column prop="standardTime" label="标准工时(分)" width="120" />
        <el-table-column label="需要质检" width="100">
          <template #default="{ row }">
            <el-checkbox :model-value="row.needQc === 1" disabled />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditStep(row)">编辑</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDeleteStep(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Route dialog -->
    <el-dialog :close-on-click-modal="false" v-model="routeDialogVisible" :title="isEditRoute ? '编辑工艺路线' : '新增工艺路线'" width="500px">
      <el-form ref="routeFormRef" :model="routeForm" :rules="routeRules" label-width="80px">
        <el-form-item label="编码" prop="routeCode">
          <el-input v-model="routeForm.routeCode" placeholder="如 RT-001" />
        </el-form-item>
        <el-form-item label="名称" prop="routeName">
          <el-input v-model="routeForm.routeName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="routeForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="routeForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="routeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRouteSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Step dialog -->
    <el-dialog :close-on-click-modal="false" v-model="stepDialogVisible" :title="isEditStep ? '编辑步骤' : '新增步骤'" width="500px">
      <el-form ref="stepFormRef" :model="stepForm" :rules="stepRules" label-width="100px">
        <el-form-item label="步骤号" prop="stepNo">
          <el-input-number v-model="stepForm.stepNo" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="工序名称" prop="stepName">
          <el-input v-model="stepForm.stepName" />
        </el-form-item>
        <el-form-item label="工作中心" prop="workCenterId">
          <el-select v-model="stepForm.workCenterId" placeholder="选择工作中心" style="width: 100%">
            <el-option v-for="wc in workCenters" :key="wc.id" :label="wc.centerName" :value="wc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标准工时" prop="standardTime">
          <el-input-number v-model="stepForm.standardTime" :min="0" :precision="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="需要质检">
          <el-switch v-model="stepForm.needQc" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stepDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStepSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getRouteList, createRoute, updateRoute, deleteRoute,
  getRouteSteps, createStep, updateStep, deleteStep, getAllWorkCenters
} from '../../api/base'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 20, keyword: '' })

const workCenters = ref([])

const currentRoute = ref(null)
const stepLoading = ref(false)
const stepList = ref([])

// Route dialog
const routeDialogVisible = ref(false)
const isEditRoute = ref(false)
const routeFormRef = ref()
const routeForm = reactive({ id: null, routeCode: '', routeName: '', description: '', status: 1 })
const routeRules = {
  routeCode: [{ required: true, message: '请输入路线编码', trigger: 'blur' }],
  routeName: [{ required: true, message: '请输入路线名称', trigger: 'blur' }]
}

// Step dialog
const stepDialogVisible = ref(false)
const isEditStep = ref(false)
const stepFormRef = ref()
const stepForm = reactive({ id: null, routeId: null, stepNo: 1, stepName: '', workCenterId: null, standardTime: 0, needQc: 0 })
const stepRules = {
  stepNo: [{ required: true, message: '请输入步骤号', trigger: 'blur' }],
  stepName: [{ required: true, message: '请输入工序名称', trigger: 'blur' }],
  workCenterId: [{ required: true, message: '请选择工作中心', trigger: 'change' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getRouteList(query)
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

async function handleRouteClick(row) {
  currentRoute.value = row
  await loadSteps(row.id)
}

async function loadSteps(routeId) {
  stepLoading.value = true
  try {
    const res = await getRouteSteps(routeId)
    stepList.value = res.data || []
  } finally {
    stepLoading.value = false
  }
}

// Route CRUD
function handleAddRoute() {
  isEditRoute.value = false
  Object.assign(routeForm, { id: null, routeCode: '', routeName: '', description: '', status: 1 })
  routeDialogVisible.value = true
}

function handleEditRoute(row) {
  isEditRoute.value = true
  Object.assign(routeForm, row)
  routeDialogVisible.value = true
}

async function handleRouteSubmit() {
  await routeFormRef.value.validate()
  if (isEditRoute.value) {
    await updateRoute(routeForm.id, routeForm)
    ElMessage.success('修改成功')
  } else {
    await createRoute(routeForm)
    ElMessage.success('新增成功')
  }
  routeDialogVisible.value = false
  loadData()
}

async function handleDeleteRoute(id) {
  await deleteRoute(id)
  ElMessage.success('删除成功')
  if (currentRoute.value && currentRoute.value.id === id) {
    currentRoute.value = null
    stepList.value = []
  }
  loadData()
}

// Step CRUD
function handleAddStep() {
  isEditStep.value = false
  Object.assign(stepForm, { id: null, routeId: currentRoute.value.id, stepNo: 1, stepName: '', workCenterId: null, standardTime: 0, needQc: 0 })
  stepDialogVisible.value = true
}

function handleEditStep(row) {
  isEditStep.value = true
  Object.assign(stepForm, row)
  stepDialogVisible.value = true
}

async function handleStepSubmit() {
  await stepFormRef.value.validate()
  if (isEditStep.value) {
    await updateStep(stepForm.id, stepForm)
    ElMessage.success('修改成功')
  } else {
    await createStep(stepForm)
    ElMessage.success('新增成功')
  }
  stepDialogVisible.value = false
  loadSteps(currentRoute.value.id)
}

async function handleDeleteStep(id) {
  await deleteStep(id)
  ElMessage.success('删除成功')
  loadSteps(currentRoute.value.id)
}

onMounted(async () => {
  loadData()
  const res = await getAllWorkCenters()
  workCenters.value = res.data
})
</script>
