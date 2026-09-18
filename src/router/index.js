import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '../utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard/realtime',
    children: [
      {
        path: 'dashboard/realtime',
        name: 'DashboardRealtime',
        component: () => import('../views/dashboard/realtime.vue'),
        meta: { title: '实时看板', icon: 'View' }
      },
      {
        path: 'dashboard/report',
        name: 'DashboardReport',
        component: () => import('../views/dashboard/report.vue'),
        meta: { title: '统计报表', icon: 'Histogram' }
      },
      {
        path: 'base/product',
        name: 'BaseProduct',
        component: () => import('../views/base/product.vue'),
        meta: { title: '产品管理', icon: 'Box' }
      },
      {
        path: 'base/material',
        name: 'BaseMaterial',
        component: () => import('../views/base/material.vue'),
        meta: { title: '物料管理', icon: 'Files' }
      },
      {
        path: 'base/route',
        name: 'BaseRoute',
        component: () => import('../views/base/route.vue'),
        meta: { title: '工艺路线', icon: 'Guide' }
      },
      {
        path: 'base/workcenter',
        name: 'BaseWorkCenter',
        component: () => import('../views/base/workcenter.vue'),
        meta: { title: '工作中心', icon: 'HomeFilled' }
      },
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('../views/order/list.vue'),
        meta: { title: '订单管理', icon: 'List' }
      },
      {
        path: 'order/progress/:id',
        name: 'OrderProgress',
        component: () => import('../views/order/progress.vue'),
        meta: { title: '订单进度', hidden: true }
      },
      {
        path: 'execution/dispatch',
        name: 'ExecutionDispatch',
        component: () => import('../views/execution/dispatch.vue'),
        meta: { title: '派工管理', icon: 'Tickets' }
      },
      {
        path: 'execution/report',
        name: 'ExecutionReport',
        component: () => import('../views/execution/report.vue'),
        meta: { title: '工序报工', icon: 'EditPen' }
      },
      {
        path: 'quality/record',
        name: 'QualityRecord',
        component: () => import('../views/quality/record.vue'),
        meta: { title: '质检记录', icon: 'Document' }
      },
      {
        path: 'equipment/list',
        name: 'EquipmentList',
        component: () => import('../views/equipment/list.vue'),
        meta: { title: '设备台账', icon: 'Cpu' }
      },
      {
        path: 'system/user',
        name: 'SystemUser',
        component: () => import('../views/system/user.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'system/role',
        name: 'SystemRole',
        component: () => import('../views/system/role.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      },
      {
        path: 'system/permission',
        name: 'SystemPermission',
        component: () => import('../views/system/permission.vue'),
        meta: { title: '权限管理', icon: 'Key' }
      },
      {
        path: 'system/dict',
        name: 'SystemDict',
        component: () => import('../views/system/dict.vue'),
        meta: { title: '数据字典', icon: 'Collection' }
      },
      {
        path: 'system/log',
        name: 'SystemLog',
        component: () => import('../views/system/log.vue'),
        meta: { title: '操作日志', icon: 'Document' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title || '') + ' - MES生产执行系统'
  if (to.path === '/login') {
    next()
  } else {
    if (getToken()) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
