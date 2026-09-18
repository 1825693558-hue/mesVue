<template>
  <div class="page-card">
    <div class="search-bar">
      <el-input v-model="query.module" placeholder="模块" clearable style="width: 180px" @keyup.enter="loadData" />
      <el-input v-model="query.username" placeholder="用户名" clearable style="width: 160px" @keyup.enter="loadData" />
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>

    <el-table :data="list" v-loading="loading" border>
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="operation" label="操作" show-overflow-tooltip />
      <el-table-column prop="method" label="方法" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="createTime" label="操作时间" width="170" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getLogList } from '../../api/system'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const query = reactive({ page: 1, size: 20, module: '', username: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await getLogList(query)
    list.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>
