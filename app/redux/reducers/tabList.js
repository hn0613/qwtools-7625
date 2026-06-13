import { createSlice } from '@reduxjs/toolkit'

const tabList = JSON.parse(sessionStorage.getItem('tabList'))

const initialState = {
  list: tabList ? tabList.list : [],
  activeKey: tabList ? tabList.activeKey : '',
}

const tabListSlice = createSlice({
  name: 'tabList',
  initialState,
  reducers: {
    requestTabList(state) {
      state.loading = false
    },
    updateTabList(state, action) {
      const data = action.payload
      const findList = state.list.find(tab => tab.key === data.key)
      if (!findList) {
        state.list.push({ key: data.key, title: data.title, closable: data.closable !== false })
      }
      state.activeKey = data.key
      state.loading = false
      sessionStorage.setItem('tabList', JSON.stringify({ list: state.list, activeKey: data.key, loading: false }))
    },
    updateTabChecked(state, action) {
      const { activeKey } = action.payload
      state.activeKey = activeKey
      state.loading = false
      sessionStorage.setItem('tabList', JSON.stringify({ ...state, activeKey, loading: false }))
    },
    deleteTabFromList(state, action) {
      const { targetKey } = action.payload
      const list = []
      let delIndex = 0
      let activeKey = state.activeKey
      state.list.forEach((tab, index) => {
        if (tab.key === targetKey) {
          delIndex = index
        } else {
          list.push(tab)
        }
      })
      if (state.activeKey === targetKey) {
        activeKey = list[delIndex] ? list[delIndex].key : (list[delIndex - 1] ? list[delIndex - 1].key : '/')
      }
      state.list = list
      state.activeKey = activeKey
      state.loading = false
      sessionStorage.setItem('tabList', JSON.stringify({ list, activeKey, loading: false }))
    },
    clearTabList(state) {
      state.list = []
      state.activeKey = ''
      state.loading = false
      sessionStorage.removeItem('tabList')
    },
  },
})

export const { requestTabList, updateTabList, updateTabChecked, deleteTabFromList, clearTabList } = tabListSlice.actions
export default tabListSlice.reducer
