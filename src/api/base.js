import request from '../utils/request'

export function getProductList(params) {
  return request.get('/product/list', { params })
}
export function getAllProducts() {
  return request.get('/product/all')
}
export function createProduct(data) {
  return request.post('/product', data)
}
export function updateProduct(id, data) {
  return request.put(`/product/${id}`, data)
}
export function deleteProduct(id) {
  return request.delete(`/product/${id}`)
}

export function getMaterialList(params) {
  return request.get('/material/list', { params })
}
export function getAllMaterials() {
  return request.get('/material/all')
}
export function createMaterial(data) {
  return request.post('/material', data)
}
export function updateMaterial(id, data) {
  return request.put(`/material/${id}`, data)
}
export function deleteMaterial(id) {
  return request.delete(`/material/${id}`)
}

export function getBomList(materialId) {
  return request.get(`/material/bom/${materialId}`)
}
export function createBom(data) {
  return request.post('/material/bom', data)
}
export function deleteBom(id) {
  return request.delete(`/material/bom/${id}`)
}

export function getWorkCenterList(params) {
  return request.get('/work-center/list', { params })
}
export function getAllWorkCenters() {
  return request.get('/work-center/all')
}
export function createWorkCenter(data) {
  return request.post('/work-center', data)
}
export function updateWorkCenter(id, data) {
  return request.put(`/work-center/${id}`, data)
}
export function deleteWorkCenter(id) {
  return request.delete(`/work-center/${id}`)
}

export function getRouteList(params) {
  return request.get('/route/list', { params })
}
export function getAllRoutes() {
  return request.get('/route/all')
}
export function createRoute(data) {
  return request.post('/route', data)
}
export function updateRoute(id, data) {
  return request.put(`/route/${id}`, data)
}
export function deleteRoute(id) {
  return request.delete(`/route/${id}`)
}
export function getRouteSteps(id) {
  return request.get(`/route/${id}/steps`)
}
export function createStep(data) {
  return request.post('/route/step', data)
}
export function updateStep(id, data) {
  return request.put(`/route/step/${id}`, data)
}
export function deleteStep(id) {
  return request.delete(`/route/step/${id}`)
}

export function getEquipmentList(params) {
  return request.get('/equipment/list', { params })
}
export function createEquipment(data) {
  return request.post('/equipment', data)
}
export function updateEquipment(id, data) {
  return request.put(`/equipment/${id}`, data)
}
export function changeEquipmentStatus(id, status) {
  return request.post(`/equipment/${id}/status`, null, { params: { status } })
}
export function deleteEquipment(id) {
  return request.delete(`/equipment/${id}`)
}
