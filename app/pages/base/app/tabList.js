import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Tabs } from 'antd'
import { updateTabChecked, deleteTabFromList } from '@actions/tabList'

function TabList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const tabList = useSelector((state) => state.tabListResult)

  const onChange = useCallback((activeKey) => {
    dispatch(updateTabChecked({ activeKey }))
    navigate(activeKey)
  }, [dispatch, navigate])

  const remove = useCallback((targetKey) => {
    if (targetKey === tabList.activeKey) {
      let delIndex = 0
      tabList.list.forEach((tab, index) => {
        if (tab.key === targetKey) {
          delIndex = index
        }
      })
      const nextTab = tabList.list[delIndex + 1] || tabList.list[delIndex - 1]
      navigate(nextTab ? nextTab.key : '/')
    }
    dispatch(deleteTabFromList({ targetKey }))
  }, [tabList, navigate, dispatch])

  const onEdit = useCallback((targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey)
    }
  }, [remove])

  const items = tabList.list.map(tab => ({
    key: tab.key,
    label: tab.title,
    closable: tab.closable !== false,
  }))

  return (
    <div className="tab-list-wrapper">
      <Tabs
        hideAdd
        onChange={onChange}
        activeKey={tabList.activeKey}
        type="editable-card"
        onEdit={onEdit}
        items={items}
        size="small"
      />
    </div>
  )
}

export default TabList
