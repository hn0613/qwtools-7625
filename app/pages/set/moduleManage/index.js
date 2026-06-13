import React, { useState, useEffect } from 'react';
import { Button, Layout, message } from 'antd';
import {
  fetchModuleList, // 获取模块列表
  fetchModuleDelete, // 删除模块
  fetchModuleDetail, // 获取模块详情
  fetchChangeModuleStatus, // 修改模块状态
  fetchModuleUpdateDetail, // 修改模块详情
  fetchModuleAdd, // 新增模块
  fetchButtonList, // 按钮权限列表
} from '@apis/manage'
import '@styles/set.less'

import ModuleList from './moduleList'
import ModuleModal from './modal/moduleAdd' // 新增修改模块
import ButtonModal from './modal/buttonModal' // 按钮权限列表
import AddButtonModal from './modal/addButtonModal' // 新增修改按钮权限

const { Content } = Layout

export default function ModuleManage() {
  // === 表格数据 ===
  const [tableDataSource, setTableDataSource] = useState([])
  const [tableListLoading, setTableListLoading] = useState(false)

  // === 菜单弹窗状态（独立） ===
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false)
  const [menuDrawerTitle, setMenuDrawerTitle] = useState('新增菜单')
  const [menuDrawerType, setMenuDrawerType] = useState('add')
  const [menuDrawerPid, setMenuDrawerPid] = useState('')
  const [menuItemId, setMenuItemId] = useState('')
  const [menuDetailData, setMenuDetailData] = useState({})

  // === 按钮列表弹窗状态（独立） ===
  const [buttonDrawerVisible, setButtonDrawerVisible] = useState(false)
  const [buttonMenuId, setButtonMenuId] = useState('')
  const [buttonListLoading, setButtonListLoading] = useState(false)
  const [buttonDataSource, setButtonDataSource] = useState([])

  // === 按钮编辑弹窗状态（独立） ===
  const [addButtonDrawerVisible, setAddButtonDrawerVisible] = useState(false)
  const [addButtonDrawerTitle, setAddButtonDrawerTitle] = useState('新增按钮权限')
  const [buttonEditState, setButtonEditState] = useState('')
  const [buttonEditData, setButtonEditData] = useState({})

  // 初始加载
  useEffect(() => {
    refreshTableList()
  }, [])

  // === 刷新函数 ===

  const refreshTableList = () => {
    setTableListLoading(true)
    fetchModuleList({}, (result) => {
      setTableListLoading(false)
      setTableDataSource(result.data.list)
    })
  }

  const refreshButtonList = (menuId) => {
    const id = menuId || buttonMenuId
    setButtonListLoading(true)
    fetchButtonList({ id }, (result) => {
      setButtonListLoading(false)
      setButtonDataSource(result.data.list)
    })
  }

  // === 菜单操作 ===

  // 删除模块
  const handleDelete = (id) => {
    fetchModuleDelete({ id }, (result) => {
      message.success(result.msg)
      refreshTableList()
    })
  }

  // 修改模块 - 先获取详情再打开弹窗
  const handleModify = (id, parentid) => {
    fetchModuleDetail({ id }, (result) => {
      setMenuDetailData(result.data)
      setMenuDrawerVisible(true)
      setMenuDrawerTitle('修改菜单')
      setMenuDrawerPid(parentid)
      setMenuItemId(id)
      setMenuDrawerType('modify')
    })
  }

  // 更改模块状态
  const handleChangeStatus = (id, val) => {
    fetchChangeModuleStatus({ id, status: val }, () => {
      refreshTableList()
    })
  }

  // 新增模块
  const moduleAdd = () => {
    setMenuDrawerVisible(true)
    setMenuDrawerTitle('新增菜单')
    setMenuDrawerPid('')
    setMenuDrawerType('add')
    setMenuDetailData({})
  }

  // 新增子菜单
  const handleAddNode = (id) => {
    setMenuDrawerVisible(true)
    setMenuDrawerTitle('新增子菜单')
    setMenuDrawerPid(id)
    setMenuDrawerType('add')
    setMenuDetailData({})
  }

  // 菜单保存成功
  const handleOk = () => {
    refreshTableList()
    setMenuDrawerVisible(false)
  }

  // 关闭菜单弹窗
  const handleCancel = () => {
    setMenuDrawerVisible(false)
    setMenuDrawerType('add')
    setMenuDetailData({})
  }

  // === 按钮权限操作 ===

  // 打开按钮权限列表
  const buttonList = (id) => {
    setButtonDrawerVisible(true)
    setButtonMenuId(id)
    refreshButtonList(id)
  }

  // 关闭按钮权限列表
  const cancelButton = () => {
    setButtonDrawerVisible(false)
  }

  // 新增按钮权限
  const addButton = () => {
    setButtonEditState('add')
    setAddButtonDrawerVisible(true)
    setAddButtonDrawerTitle('新增按钮权限')
  }

  // 修改按钮权限
  const editButton = (params) => {
    setButtonEditState('edit')
    setButtonEditData(params)
    setAddButtonDrawerVisible(true)
    setAddButtonDrawerTitle('修改按钮权限')
  }

  // 保存按钮权限
  const handleAdd = (params) => {
    if (buttonEditState !== 'add') {
      fetchModuleUpdateDetail({ ...params, parentId: buttonMenuId }, (result) => {
        message.success(result.msg)
        handleAddCancel()
      })
    } else {
      fetchModuleAdd({ ...params, parentId: buttonMenuId }, (result) => {
        message.success(result.msg)
        handleAddCancel()
      })
    }
  }

  // 关闭按钮编辑弹窗并刷新列表
  const handleAddCancel = () => {
    setAddButtonDrawerVisible(false)
    setButtonEditData({})
    refreshButtonList()
  }

  // === 渲染 ===

  const menuValues = menuDrawerType === 'modify' ? menuDetailData : {}

  return (
    <div className="page page-scrollfix page-usermanage page-modulemanage">
      <Layout>
        <Layout className="page-body">
          <Content>
            <div className="page-content">
              <ModuleList
                dataSource={tableDataSource}
                loading={tableListLoading}
                onDelete={handleDelete}
                onModify={handleModify}
                onUpdataStatus={handleChangeStatus}
                onAddNode={handleAddNode}
                buttonList={buttonList}
              />
            </div>
            <div className="page-footer">
              <div className="page-footer-buttons">
                <Button type="primary" onClick={moduleAdd}> 新增模块</Button>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
      {
        menuDrawerVisible ?
          <ModuleModal
            handleOk={handleOk}
            visible={menuDrawerVisible}
            title={menuDrawerTitle}
            pid={menuDrawerPid}
            itemId={menuItemId}
            values={menuValues}
            type={menuDrawerType}
            onCancel={handleCancel}
          />
          : null
      }
      {
        buttonDrawerVisible ?
          <ButtonModal
            visible={buttonDrawerVisible}
            addButton={addButton}
            cancelButton={cancelButton}
            editButton={editButton}
            listLoading={buttonListLoading}
            dataSource={buttonDataSource}
            updateList={() => { refreshButtonList() }}
          />
          : null
      }
      {
        addButtonDrawerVisible ?
          <AddButtonModal
            title={addButtonDrawerTitle}
            visible={addButtonDrawerVisible}
            onCancel={handleAddCancel}
            handleAdd={handleAdd}
            state={buttonEditState}
            buttonEditData={buttonEditData}
          />
          : null
      }
    </div>
  )
}
