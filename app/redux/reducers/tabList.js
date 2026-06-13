import { createSlice } from '@reduxjs/toolkit'
import { HOME_PATH, routeMeta } from '@configs/routeConfig'

// 首页页签，始终存在
const homeTab = { key: HOME_PATH, title: routeMeta[HOME_PATH] || '首页' }

// 从 sessionStorage 恢复并校验
function restoreTabList() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('tabList'))
    if (saved && Array.isArray(saved.list) && saved.list.length > 0) {
      // 确保首页 tab 始终存在
      const hasHome = saved.list.some(tab => tab.key === HOME_PATH)
      const list = hasHome ? saved.list : [homeTab, ...saved.list]
      // 校验 activeKey 是否指向列表中真实存在的 tab
      const activeKeyValid = list.some(tab => tab.key === saved.activeKey)
      const activeKey = activeKeyValid ? saved.activeKey : HOME_PATH
      return { list, activeKey, loading: false }
    }
  } catch (e) {
    // sessionStorage 数据损坏，回退到默认态
  }
  return { list: [homeTab], activeKey: HOME_PATH, loading: false }
}

function save(state) {
  sessionStorage.setItem('tabList', JSON.stringify({
    list: state.list,
    activeKey: state.activeKey,
  }))
}

const initialState = restoreTabList()

const tabListSlice = createSlice({
  name: 'tabList',
  initialState,
  reducers: {
    requestTabList(state) {
      state.loading = false
    },

    // 新增或激活页签：已存在则更新标题并激活，不存在则追加
    updateTabList(state, action) {
      const { key, title } = action.payload
      const existing = state.list.find(tab => tab.key === key)
      if (existing) {
        // 已打开过，更新标题（菜单名可能变化）并激活
        existing.title = title || existing.title
      } else {
        state.list.push({ key, title: title || key })
      }
      state.activeKey = key
      state.loading = false
      save(state)
    },

    // 仅切换激活态（点击已有页签时触发）
    updateTabChecked(state, action) {
      const { activeKey } = action.payload
      state.activeKey = activeKey
      state.loading = false
      save(state)
    },

    // 关闭页签：关闭当前页签时自动落到相邻页签
    deleteTabFromList(state, action) {
      const { targetKey } = action.payload
      const delIndex = state.list.findIndex(tab => tab.key === targetKey)
      if (delIndex === -1) return

      // 先算出关闭后要激活的 key（基于关闭前的列表位置）
      let nextActiveKey = state.activeKey
      if (state.activeKey === targetKey) {
        const nextTab = state.list[delIndex + 1]
        const prevTab = state.list[delIndex - 1]
        nextActiveKey = (nextTab ? nextTab.key : (prevTab ? prevTab.key : HOME_PATH))
      }

      // 移除目标 tab
      state.list = state.list.filter(tab => tab.key !== targetKey)

      // 确保首页 tab 始终存在：如果删光了就补回首页
      if (state.list.length === 0) {
        state.list = [homeTab]
        nextActiveKey = HOME_PATH
      }

      state.activeKey = nextActiveKey
      state.loading = false
      save(state)
    },

    // 重置页签（退出登录 / 鉴权失败时调用）
    resetTabList(state) {
      state.list = [homeTab]
      state.activeKey = HOME_PATH
      state.loading = false
      sessionStorage.removeItem('tabList')
    },
  },
})

export const {
  requestTabList,
  updateTabList,
  updateTabChecked,
  deleteTabFromList,
  resetTabList,
} = tabListSlice.actions

export default tabListSlice.reducer
