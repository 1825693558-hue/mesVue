import request from '../utils/request'

export function getUserList(params) {
  return request.get('/system/user/list', { params })
}
export function createUser(data) {
  return request.post('/system/user', data)
}
export function updateUser(id, data) {
  return request.put(`/system/user/${id}`, data)
}
export function deleteUser(id) {
  return request.delete(`/system/user/${id}`)
}
export function resetPassword(id, newPassword) {
  return request.post(`/system/user/${id}/reset-password`, null, { params: { newPassword } })
}

export function getRoleList(params) {
  return request.get('/system/role/list', { params })
}
export function getAllRoles() {
  return request.get('/system/role/all')
}
export function createRole(data) {
  return request.post('/system/role', data)
}
export function updateRole(id, data) {
  return request.put(`/system/role/${id}`, data)
}
export function deleteRole(id) {
  return request.delete(`/system/role/${id}`)
}
export function getRolePermissions(id) {
  return request.get(`/system/role/${id}/permissions`)
}
export function assignRolePermissions(id, permissionIds) {
  return request.post(`/system/role/${id}/permissions`, permissionIds)
}

export function getPermissionTree() {
  return request.get('/system/permission/tree')
}
export function createPermission(data) {
  return request.post('/system/permission', data)
}
export function updatePermission(id, data) {
  return request.put(`/system/permission/${id}`, data)
}
export function deletePermission(id) {
  return request.delete(`/system/permission/${id}`)
}

export function getDictList(dictType) {
  return request.get('/system/dict/list', { params: { dictType } })
}
export function getDictByType(dictType) {
  return request.get(`/system/dict/type/${dictType}`)
}
export function createDict(data) {
  return request.post('/system/dict', data)
}
export function updateDict(id, data) {
  return request.put(`/system/dict/${id}`, data)
}
export function deleteDict(id) {
  return request.delete(`/system/dict/${id}`)
}

export function getLogList(params) {
  return request.get('/system/log/list', { params })
}
