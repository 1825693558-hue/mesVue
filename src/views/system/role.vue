<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.keyword" placeholder="角色编码/名称" clearable style="width: 200px" @keyup.enter="loadData" />
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="roleCode" label="角色编码" width="140" />
      <el-table-column prop="roleName" label="角色名称" width="140" />
      <el-table-column prop="remark" label="备注" show-overflow-tooltip />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="primary" @click="openPermission(row)">分配权限</el-button>
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

    <!-- Role dialog -->
    <el-dialog :close-on-click-modal="false" v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="编码" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="如 ROLE_ADMIN" />
        </el-form-item>
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="form.roleName" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
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

    <!-- Permission dialog -->
    <el-dialog :close-on-click-modal="false" v-model="permVisible" :title="`分配权限 - ${currentRole?.roleName || ''}`" width="500px">
      <el-tree
        ref="permTreeRef"
        :data="permTreeData"
        show-checkbox
        node-key="id"
        :props="{ label: 'permissionName', children: 'children' }"
        default-expand-all
      />
      <template #footer>
        <el-button @click="permVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAssignPermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getRoleList, createRole, updateRole, deleteRole,
  getRolePermissions, assignRolePermissions, getPermissionTree
} from '../../api/system'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 20, keyword: '' })

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const form = reactive({ id: null, roleCode: '', roleName: '', remark: '', status: 1 })
const rules = {
  roleCode: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const permVisible = ref(false)
const currentRole = ref(null)
const permTreeRef = ref()
const permTreeData = ref([])

async function loadData() {
  loading.value = true
  try {
    const res = await getRoleList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  Object.assign(form, { id: null, roleCode: '', roleName: '', remark: '', status: 1 })
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
    await updateRole(form.id, form)
    ElMessage.success('修改成功')
  } else {
    await createRole(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id) {
  await deleteRole(id)
  ElMessage.success('删除成功')
  loadData()
}

async function openPermission(row) {
  currentRole.value = row
  permVisible.value = true
  const [treeRes, permRes] = await Promise.all([
    getPermissionTree(),
    getRolePermissions(row.id)
  ])
  permTreeData.value = treeRes.data || []
  const checkedIds = permRes.data || []
  // wait for tree to render, then set checked keys
  setTimeout(() => {
    permTreeRef.value.setCheckedKeys(checkedIds)
  }, 100)
}

async function handleAssignPermissions() {
  const checkedKeys = permTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permTreeRef.value.getHalfCheckedKeys()
  const allKeys = [...checkedKeys, ...halfCheckedKeys]
  await assignRolePermissions(currentRole.value.id, allKeys)
  ElMessage.success('权限分配成功')
  permVisible.value = false
}

onMounted(loadData)
</script>
