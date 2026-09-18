<template>
  <div class="page-card">
    <div class="table-toolbar">
      <span style="font-weight: 700">权限管理</span>
      <el-button type="primary" @click="handleAdd(null)">新增顶级权限</el-button>
    </div>

    <el-table
      :data="treeData"
      v-loading="loading"
      border
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="permName" label="权限名称" width="200" />
      <el-table-column prop="permCode" label="权限编码" width="180" />
      <el-table-column label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.permType === 1 ? 'primary' : 'success'" size="small">
            {{ row.permType === 1 ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路径" width="160" />
      <el-table-column prop="sort" label="排序" width="60" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleAdd(row)">新增子项</el-button>
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑权限' : '新增权限'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级权限">
          <el-input :model-value="form.parentId ? getParentName(form.parentId) : '顶级权限'" disabled />
        </el-form-item>
        <el-form-item label="权限名称" prop="permName">
          <el-input v-model="form.permName" />
        </el-form-item>
        <el-form-item label="权限编码" prop="permCode">
          <el-input v-model="form.permCode" placeholder="如 system:user:add" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.permType">
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="路径">
          <el-input v-model="form.path" placeholder="如 /system/user" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
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
import { getPermissionTree, createPermission, updatePermission, deletePermission } from '../../api/system'

const loading = ref(false)
const treeData = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({
  id: null, parentId: null, permName: '', permCode: '', permType: 1, path: '', sort: 0
})
const rules = {
  permName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  permCode: [{ required: true, message: '请输入权限编码', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    const res = await getPermissionTree()
    treeData.value = res.data || []
  } finally {
    loading.value = false
  }
}

function getParentName(parentId) {
  let name = ''
  function traverse(nodes) {
    for (const node of nodes) {
      if (node.id === parentId) {
        name = node.permName
        return
      }
      if (node.children) traverse(node.children)
    }
  }
  traverse(treeData.value)
  return name
}

function handleAdd(parent) {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    parentId: parent ? parent.id : null,
    permName: '', permCode: '', permType: 1, path: '', sort: 0
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
    await updatePermission(form.id, form)
    ElMessage.success('修改成功')
  } else {
    await createPermission(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id) {
  await deletePermission(id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
