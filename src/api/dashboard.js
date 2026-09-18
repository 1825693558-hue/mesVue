import request from '../utils/request'

export function getOverview() {
  return request.get('/dashboard/overview')
}
export function getWorkCenterStatus() {
  return request.get('/dashboard/work-center-status')
}
export function getOrderProgress() {
  return request.get('/dashboard/order-progress')
}
export function getAlerts() {
  return request.get('/dashboard/alerts')
}
export function getProductionDaily(date) {
  return request.get('/dashboard/report/production-daily', { params: { date } })
}
export function getQualityAnalysis(startDate, endDate) {
  return request.get('/dashboard/report/quality-analysis', { params: { startDate, endDate } })
}
export function getOeeAnalysis() {
  return request.get('/dashboard/report/oee')
}
