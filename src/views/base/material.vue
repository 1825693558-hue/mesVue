<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.keyword" placeholder="物料编码/名称" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-select v-model="query.materialType" placeholder="物料类型" clearable style="width: 120px">
        <el-option label="原材料" :value="1" />
        <el-option label="半成品" :value="2" />
        <el-option label="成品" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增物料</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="materialCode" label="物料编码" width="140" />
      <el-table-column prop="materialName" label="物料名称" />
      <el-table-column prop="specification" label="规格型号" />
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag :type="materialTypeTag(row.materialType)" size="small">
            {{ materialTypeText(row.materialType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="primary" @click="openBom(row)">BOM</el-button>
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

    <!-- Material dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑物料' : '新增物料'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编码" prop="materialCode">
          <el-input v-model="form.materialCode" placeholder="如 M2024-001" />
        </el-form-item>
        <el-form-item label="名称" prop="materialName">
          <el-input v-model="form.materialName" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.specification" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="如 个/kg/米" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.materialType">
            <el-radio :value="1">原材料</el-radio>
            <el-radio :value="2">半成品</el-radio>
            <el-radio :value="3">成品</el-radio>
          </el-radio-group>
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

    <!-- BOM dialog -->
    <el-dialog v-model="bomVisible" :title="`BOM管理 - ${currentMaterial?.materialName || ''}`" width="700px">
      <div class="search-bar">
        <el-select v-model="bomForm.childMaterialId" placeholder="选择子物料" filterable style="width: 240px">
          <el-option v-for="m in allMaterials" :key="m.id" :label="`${m.materialCode} - ${m.materialName}`" :value="m.id" />
        </el-select>
        <el-input-number v-model="bomForm.quantity" :min="0.01" :precision="3" placeholder="用量" style="width: 140px" />
        <el-button type="primary" @click="handleAddBom">添加BOM</el-button>
      </div>

      <el-table :data="bomList" border size="small">
        <el-table-column prop="childMaterialCode" label="子物料编码" width="140" />
        <el-table-column prop="childMaterialName" label="子物料名称" />
        <el-table-column prop="quantity" label="用量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-popconfirm title="确定删除？" @confirm="handleDeleteBom(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMaterialList, createMaterial, updateMaterial, deleteMaterial,
  getAllMaterials, getBomList, createBom, deleteBom
} from '../../api/base'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const allMaterials = ref([])
const query = reactive({ page: 1, size: 20, keyword: '', materialType: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: null, materialCode: '', materialName: '', specification: '',
  unit: '', materialType: 1, status: 1
})
const rules = {
  materialCode: [{ required: true, message: '请输入物料编码', trigger: 'blur' }],
  materialName: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

const bomVisible = ref(false)
const currentMaterial = ref(null)
const bomList = ref([])
const bomForm = reactive({ childMaterialId: null, quantity: 1 })

async function loadData() {
  loading.value = true
  try {
    const res = await getMaterialList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function materialTypeText(type) {
  return ['', '原材料', '半成品', '成品'][type] || '未知'
}

function materialTypeTag(type) {
  return ['', 'info', 'warning', 'success'][type] || 'info'
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, {
    id: null, materialCode: '', materialName: '', specification: '',
    unit: '', materialType: 1, status: 1
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
    await updateMaterial(form.id, form)
    ElMessage.success('修改成功')
  } else {
    await createMaterial(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id) {
  await deleteMaterial(id)
  ElMessage.success('删除成功')
  loadData()
}

async function openBom(row) {
  currentMaterial.value = row
  bomVisible.value = true
  Object.assign(bomForm, { childMaterialId: null, quantity: 1 })
  await loadBom(row.id)
}

async function loadBom(materialId) {
  const res = await getBomList(materialId)
  bomList.value = res.data || []
}

async function handleAddBom() {
  if (!bomForm.childMaterialId) {
    ElMessage.warning('请选择子物料')
    return
  }
  await createBom({
    materialId: currentMaterial.value.id,
    childMaterialId: bomForm.childMaterialId,
    quantity: bomForm.quantity
  })
  ElMessage.success('添加成功')
  Object.assign(bomForm, { childMaterialId: null, quantity: 1 })
  loadBom(currentMaterial.value.id)
}

async function handleDeleteBom(id) {
  await deleteBom(id)
  ElMessage.success('删除成功')
  loadBom(currentMaterial.value.id)
}

onMounted(async () => {
  loadData()
  const res = await getAllMaterials()
  allMaterials.value = res.data
})
</script>
