# MES 生产执行演示系统 - 前端

## 项目简介

基于 Vue 3 + Element Plus + ECharts 构建的 MES 前端应用，提供车间看板、生产订单、派工报工、质量管理、设备台账等业务页面，支持响应式布局与实时数据展示。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3.4.x | 前端框架 |
| Vue Router | 4.3.x | 路由管理 |
| Pinia | 2.1.x | 状态管理 |
| Element Plus | 2.7.x | UI 组件库 |
| @element-plus/icons-vue | 2.3.x | 图标库 |
| Axios | 1.7.x | HTTP 请求 |
| ECharts | 5.5.x | 图表可视化 |
| Day.js | 1.11.x | 日期处理 |
| Vite | 5.3.x | 构建工具 |

## 目录结构

```
frontend/
├── index.html                   # HTML 入口
├── package.json                 # 依赖与脚本
├── vite.config.js               # Vite 配置（含 API 代理）
├── src/
│   ├── main.js                  # 应用入口
│   ├── App.vue                  # 根组件
│   ├── api/                     # 接口请求层
│   │   ├── base.js              #   基础数据接口
│   │   ├── auth.js              #   认证接口
│   │   ├── dashboard.js         #   看板接口
│   │   ├── order.js             #   订单接口
│   │   └── system.js            #   系统管理接口
│   ├── router/
│   │   └── index.js             # 路由配置
│   ├── stores/                  # Pinia 状态管理
│   │   ├── user.js              #   用户状态
│   │   └── dict.js              #   字典缓存
│   ├── utils/
│   │   ├── request.js           # Axios 封装（拦截器、Token）
│   │   └── auth.js              # Token 管理
│   ├── layout/
│   │   └── index.vue            # 侧边栏 + 顶栏布局
│   ├── styles/
│   │   └── main.css             # 全局样式
│   └── views/                   # 页面组件
│       ├── login/index.vue          # 登录页
│       ├── dashboard/
│       │   ├── realtime.vue        # 实时看板
│       │   └── report.vue          # 报表看板
│       ├── order/
│       │   ├── list.vue            # 订单列表
│       │   └── progress.vue        # 订单进度
│       ├── execution/
│       │   ├── dispatch.vue        # 派工管理
│       │   └── report.vue          # 报工管理
│       ├── quality/record.vue      # 质检记录
│       ├── equipment/list.vue      # 设备台账
│       ├── base/
│       │   ├── product.vue         # 产品管理
│       │   ├── material.vue        # 物料管理
│       │   ├── route.vue           # 工艺路线
│       │   └── workcenter.vue      # 工作中心
│       └── system/
│           ├── user.vue            # 用户管理
│           ├── role.vue            # 角色管理
│           ├── permission.vue      # 权限管理
│           ├── dict.vue            # 数据字典
│           └── log.vue             # 操作日志
└── dev.log                      # 开发服务器日志
```

## 环境要求

- Node.js 18+
- npm 9+ 或 pnpm

## 快速启动

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

开发服务器启动在 `http://localhost:3000`，API 请求自动代理到 `http://localhost:8080`。

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可部署到 Nginx 或其他静态服务器。

### 预览构建产物

```bash
npm run preview
```

## 配置说明

`vite.config.js` 核心配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| server.port | 3000 | 开发服务器端口 |
| server.proxy /api | http://localhost:8080 | 后端 API 代理地址 |
| resolve.alias @ | src | 路径别名 |

切换后端地址：修改 `vite.config.js` 中 `proxy.target` 即可。

## 页面与后端接口对照

| 页面 | 路由路径 | 主要后端接口 |
|------|----------|-------------|
| 登录 | /login | POST /api/auth/login |
| 实时看板 | /dashboard/realtime | GET /api/dashboard/overview |
| 报表看板 | /dashboard/report | GET /api/dashboard/overview |
| 订单列表 | /order/list | GET /api/production-order/list |
| 订单进度 | /order/progress | GET /api/production-order/list |
| 派工管理 | /execution/dispatch | GET /api/dispatch/list |
| 报工管理 | /execution/report | GET /api/work-report/list |
| 质检记录 | /quality/record | GET /api/quality-record/list |
| 设备台账 | /equipment/list | GET /api/equipment/list |
| 产品管理 | /base/product | GET /api/product/list |
| 物料管理 | /base/material | GET /api/material/list |
| 工艺路线 | /base/route | GET /api/route/list |
| 工作中心 | /base/workcenter | GET /api/work-center/list |
| 用户管理 | /system/user | GET /api/system/user/list |
| 角色管理 | /system/role | GET /api/system/role/list |
| 数据字典 | /system/dict | GET /api/system/dict/list |
| 操作日志 | /system/log | GET /api/operation-log/list |

## 测试账号

| 用户名 | 密码 |
|--------|------|
| admin | 123456 |
