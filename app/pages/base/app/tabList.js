import React, { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Tabs } from 'antd'
import { updateTabChecked, deleteTabFromList } from '@actions/tabList'

function TabList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const tabList = useSelector((state) => state.tabListResult)
  const prevActiveKeyRef = useRef(tabList.activeKey)

  // 当 Redux 中的 activeKey 发生变化时（关闭当前页签、重置等），
  // 自动导航到新的 activeKey 对应路由，保持 URL 与页签同步
  useEffect(() => {
    const { activeKey } = tabList
    if (activeKey && activeKey !== prevActiveKeyRef.current) {
      navigate(`/${activeKey}`, { replace: true })
    }
    prevActiveKeyRef.current = activeKey
  }, [tabList.activeKey, navigate])

  // 点击切换已有页签
  const onChange = useCallback((activeKey) => {
    dispatch(updateTabChecked({ activeKey }))
    navigate(`/${activeKey}`)
  }, [dispatch, navigate])

  // 关闭页签
  const onEdit = useCallback((targetKey, action) => {
    if (action !== 'remove') return

    // dispatch 会在 reducer 里计算关闭后该激活哪个页签
    // 上面的 useEffect 会自动导航到新的 activeKey
    dispatch(deleteTabFromList({ targetKey }))

    // 如果关闭的不是当前激活页签，activeKey 不变，useEffect 不会触发
    // 所以这里只对"关闭的是当前页签"的情况不需要额外处理
    // 如果关闭的是非当前页签，URL 不变，无需导航
    if (targetKey !== tabList.activeKey) {
      // 关闭非当前页签，不需要导航
    }
  }, [dispatch, tabList.activeKey])

  // 阻止默认的键盘行为，避免不必要的导航
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
    }
  }, [])

  const items = tabList.list.map(tab => ({
    key: tab.key,
    label: tab.title,
    // 页签内容区域不渲染（实际页面内容通过 Outlet 在 App.js 中渲染）
    children: null,
  }))

  if (!tabList.list || tabList.list.length === 0) {
    return null
  }

  return (
    <div className="tab-list-container">
      <Tabs
        hideAdd
        activeKey={tabList.activeKey}
        type="editable-card"
        onChange={onChange}
        onEdit={onEdit}
        items={items}
        onKeyDown={onKeyDown}
        size="small"
      />
    </div>
  )
}

export default TabList
