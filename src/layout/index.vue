<template>
  <div class="app-container">
    <!-- Sidebar -->
    <div class="sidebar-container" :class="{ collapsed: isCollapse }">
      <div class="sidebar-header">
        <span v-if="!isCollapse" class="sidebar-title">MES 生产执行系统</span>
        <span v-else class="sidebar-title-short">MES</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#ffffff"
        router
      >
        <template v-for="item in menuGroups" :key="item.title">
          <el-sub-menu v-if="item.children.length > 0" :index="item.title">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.children[0].path">
            <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>

    <!-- Main -->
    <div class="main-container">
      <div class="navbar">
        <div class="navbar-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="navbar-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span style="margin-left: 6px">{{ userStore.userInfo.realName || userStore.userInfo.username || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const menuConfig = [
  { title: '车间看板', icon: 'DataLine', children: [
    { path: '/dashboard/realtime', title: '实时看板', icon: 'View' },
    { path: '/dashboard/report', title: '统计报表', icon: 'Histogram' }
  ]},
  { title: '基础数据', icon: 'Folder', children: [
    { path: '/base/product', title: '产品管理', icon: 'Box' },
    { path: '/base/material', title: '物料管理', icon: 'Files' },
    { path: '/base/route', title: '工艺路线', icon: 'Guide' },
    { path: '/base/workcenter', title: '工作中心', icon: 'HomeFilled' }
  ]},
  { title: '生产订单', icon: 'Document', children: [
    { path: '/order/list', title: '订单管理', icon: 'List' }
  ]},
  { title: '生产执行', icon: 'Tools', children: [
    { path: '/execution/dispatch', title: '派工管理', icon: 'Tickets' },
    { path: '/execution/report', title: '工序报工', icon: 'EditPen' }
  ]},
  { title: '质量管理', icon: 'Checked', children: [
    { path: '/quality/record', title: '质检记录', icon: 'Document' }
  ]},
  { title: '设备管理', icon: 'Monitor', children: [
    { path: '/equipment/list', title: '设备台账', icon: 'Cpu' }
  ]},
  { title: '系统管理', icon: 'Setting', children: [
    { path: '/system/user', title: '用户管理', icon: 'User' },
    { path: '/system/role', title: '角色管理', icon: 'UserFilled' },
    { path: '/system/permission', title: '权限管理', icon: 'Key' },
    { path: '/system/dict', title: '数据字典', icon: 'Collection' },
    { path: '/system/log', title: '操作日志', icon: 'Document' }
  ]}
]

const menuGroups = computed(() => {
  if (userStore.permissions.has('*:*:*')) return menuConfig
  return menuConfig
})

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (userStore.token && !userStore.userInfo.username) {
    await userStore.fetchUserInfo()
  }
})
</script>

<style scoped>
.sidebar-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #002140;
}
.sidebar-title {
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}
.sidebar-title-short {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}
.sidebar-container .el-menu {
  border-right: none;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
}
.collapse-btn:hover {
  color: #1a56db;
}
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #475569;
}
</style>
