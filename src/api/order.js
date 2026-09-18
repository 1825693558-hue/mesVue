import request from '../utils/request'

export function getOrderList(params) {
  return request.get('/production-order/list', { params })
}
export function createOrder(data) {
  return request.post('/production-order', data)
}
export function releaseOrder(id) {
  return request.post(`/production-order/${id}/release`)
}
export function closeOrder(id) {
  return request.post(`/production-order/${id}/close`)
}
export function getOrderProgress(id) {
  return request.get(`/production-order/${id}/progress`)
}

export function getDispatchList(params) {
  return request.get('/dispatch/list', { params })
}
export function getMyDispatchList(params) {
  return request.get('/dispatch/my', { params })
}
export function startDispatch(id) {
  return request.post(`/dispatch/${id}/start`)
}
export function pauseDispatch(id) {
  return request.post(`/dispatch/${id}/pause`)
}
export function completeDispatch(id) {
  return request.post(`/dispatch/${id}/complete`)
}
export function assignOperator(id, operatorId) {
  return request.post(`/dispatch/${id}/assign`, null, { params: { operatorId } })
}

export function submitReport(data) {
  return request.post('/work-report', data)
}
export function getReportList(params) {
  return request.get('/work-report/list', { params })
}

export function getQualityList(params) {
  return request.get('/quality-record/list', { params })
}
export function createQualityRecord(data) {
  return request.post('/quality-record', data)
}
