import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo, getMenus, logout as logoutApi } from '../api/auth'
import { getToken, setToken, removeToken } from '../utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const userInfo = ref({})
  const permissions = ref(new Set())
  const menus = ref([])

  async function login(loginForm) {
    const res = await loginApi(loginForm)
    token.value = res.data.token
    setToken(res.data.token)
    return res
  }

  async function fetchUserInfo() {
    const res = await getUserInfo()
    userInfo.value = res.data
    permissions.value = new Set(res.data.permissions || [])
    return res
  }

  async function fetchMenus() {
    const res = await getMenus()
    menus.value = res.data || []
    return res
  }

  function hasPermission(code) {
    if (permissions.value.has('*:*:*')) return true
    return permissions.value.has(code)
  }

  async function logout() {
    try {
      await logoutApi()
    } finally {
      token.value = ''
      userInfo.value = {}
      permissions.value = new Set()
      menus.value = []
      removeToken()
    }
  }

  return {
    token,
    userInfo,
    permissions,
    menus,
    login,
    fetchUserInfo,
    fetchMenus,
    hasPermission,
    logout
  }
})
