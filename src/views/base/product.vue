<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.keyword" placeholder="产品编码/名称" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-select v-model="query.productType" placeholder="产品类型" clearable style="width: 120px">
        <el-option label="成品" :value="1" />
        <el-option label="半成品" :value="2" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增产品</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="productCode" label="产品编码" width="120" />
      <el-table-column prop="productName" label="产品名称" />
      <el-table-column prop="specification" label="规格型号" />
      <el-table-column prop="unit" label="单位" width="60" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.productType === 1 ? 'success' : 'warning'" size="small">
            {{ row.productType === 1 ? '成品' : '半成品' }}
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑产品' : '新增产品'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="如 P2024-001" />
        </el-form-item>
        <el-form-item label="名称" prop="productName">
          <el-input v-model="form.productName" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.specification" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="如 个/台/套" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.productType">
            <el-radio :value="1">成品</el-radio>
            <el-radio :value="2">半成品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="工艺路线">
          <el-select v-model="form.routeId" placeholder="选择工艺路线" style="width: 100%">
            <el-option v-for="r in routes" :key="r.id" :label="r.routeName" :value="r.id" />
          </el-select>
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
import { getProductList, createProduct, updateProduct, deleteProduct } from '../../api/base'
import { getAllRoutes } from '../../api/base'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const routes = ref([])
const query = reactive({ page: 1, size: 20, keyword: '', productType: null })
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: null, productCode: '', productName: '', specification: '',
  unit: '', productType: 1, routeId: null, status: 1
})
const rules = {
  productCode: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
  productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getProductList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, { id: null, productCode: '', productName: '', specification: '', unit: '', productType: 1, routeId: null, status: 1 })
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
    await updateProduct(form.id, form)
    ElMessage.success('修改成功')
  } else {
    await createProduct(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id) {
  await deleteProduct(id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(async () => {
  loadData()
  const res = await getAllRoutes()
  routes.value = res.data
})
</script>
