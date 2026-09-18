import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDictByType } from '../api/system'

export const useDictStore = defineStore('dict', () => {
  const dictMap = ref({})

  async function loadDict(dictType) {
    if (dictMap.value[dictType]) return dictMap.value[dictType]
    const res = await getDictByType(dictType)
    dictMap.value[dictType] = res.data || []
    return dictMap.value[dictType]
  }

  function getDictLabel(dictType, value) {
    const list = dictMap.value[dictType] || []
    const item = list.find(d => d.dictValue === String(value))
    return item ? item.dictLabel : value
  }

  function getDictOptions(dictType) {
    return dictMap.value[dictType] || []
  }

  return { dictMap, loadDict, getDictLabel, getDictOptions }
})
