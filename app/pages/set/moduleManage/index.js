import React, { Component } from 'react';
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

// 菜单弹窗初始状态
const MENU_MODAL_INIT = {
  visible: false,
  title: '',
  formType: 'add',       // 'add' | 'modify'
  parentId: '',
  itemId: '',
  initialValues: {},
}

export default class userManage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // ---- 菜单弹窗 ----
      menuModal: { ...MENU_MODAL_INIT },

      // ---- 按钮权限弹窗 ----
      buttonVisible: false,
      buttonParentId: '',
      buttonMenuId: '',
      addButtonVisible: false,
      buttonEditState: 'add',
      buttonEditData: {},
      buttonDataSource: [],
      buttonListLoading: false,

      // ---- 主列表 ----
      tableListLoading: false,
      tableDataSource: [],
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleModify = this.handleModify.bind(this);
    this.moduleAdd = this.moduleAdd.bind(this);
    this.handleAddNode = this.handleAddNode.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChangeStatus = this.handleChangeStatus.bind(this);
    this.buttonList = this.buttonList.bind(this);
    this.cancelButton = this.cancelButton.bind(this);
    this.addButton = this.addButton.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleAddCancel = this.handleAddCancel.bind(this);
    this.editButton = this.editButton.bind(this);
  }

  componentWillMount() {
    if (!(sessionStorage.getItem('roleName') === '0')) {
      // 非超级管理员
    }
    this.getTableList();
  }

  // ===================== 主列表操作 =====================

  // 删除模块
  handleDelete(id) {
    fetchModuleDelete({ id }, (result) => {
      message.success(result.msg);
      this.getTableList();
    });
  }

  // 更改模块显隐状态
  handleChangeStatus(id, val) {
    fetchChangeModuleStatus({ id, status: val }, () => {
      this.getTableList();
    });
  }

  // 刷新主列表
  getTableList() {
    this.setState({ tableListLoading: true }, () => {
      fetchModuleList({}, (result) => {
        this.setState({
          tableListLoading: false,
          tableDataSource: result.data.list,
        })
      })
    })
  }

  // ===================== 菜单弹窗：数据准备 =====================
  // 三种入口（新增 / 新增子级 / 编辑）统一通过 openMenuModal 打开弹窗，
  // 保证 menuModal 状态始终完整、不会出现字段遗漏。

  openMenuModal(config) {
    this.setState({
      menuModal: { ...MENU_MODAL_INIT, ...config, visible: true },
    })
  }

  // 新增模块（顶级）
  moduleAdd() {
    this.openMenuModal({
      title: '新增菜单',
      formType: 'add',
      parentId: '',
      initialValues: {},
    })
  }

  // 新增子菜单
  handleAddNode(id) {
    this.openMenuModal({
      title: '新增子菜单',
      formType: 'add',
      parentId: id,
      initialValues: { parentId: id },
    })
  }

  // 编辑菜单 —— 先拉详情，再打开弹窗回填
  handleModify(id, parentid) {
    fetchModuleDetail({ id }, (result) => {
      const detail = result.data || {}
      this.openMenuModal({
        title: '修改菜单',
        formType: 'modify',
        parentId: parentid,
        itemId: id,
        initialValues: {
          parentId: parentid || '',
          resName: detail.resName || '',
          sort: `${detail.sort ?? '0'}`,
          resModule: detail.resModule || '',
          resKey: `${detail.resKey || ''}`,
          resIcon: `${detail.resIcon || ''}`,
        },
      })
    })
  }

  // ===================== 菜单弹窗：保存 / 关闭 =====================

  // 保存成功后统一刷新列表并关闭弹窗
  handleOk() {
    this.setState({ menuModal: { ...MENU_MODAL_INIT } })
    this.getTableList()
  }

  // 取消弹窗
  handleCancel() {
    this.setState({ menuModal: { ...MENU_MODAL_INIT } })
  }

  // ===================== 按钮权限弹窗 =====================

  // 打开按钮权限列表
  buttonList(id, parentid) {
    this.setState({
      buttonVisible: true,
      buttonParentId: parentid,
      buttonMenuId: id,
    }, () => {
      this.getButtonList()
    })
  }

  // 关闭按钮权限列表
  cancelButton() {
    this.setState({ buttonVisible: false })
  }

  // 打开新增按钮弹窗
  addButton() {
    this.setState({
      buttonEditState: 'add',
      buttonEditData: {},
      addButtonVisible: true,
    })
  }

  // 打开编辑按钮弹窗
  editButton(record) {
    this.setState({
      buttonEditState: 'edit',
      buttonEditData: record,
      addButtonVisible: true,
    })
  }

  // 新增 / 修改按钮权限提交
  handleAdd(params) {
    const { buttonEditState, buttonMenuId } = this.state
    const payload = { ...params, parentId: buttonMenuId }
    if (buttonEditState === 'edit') {
      fetchModuleUpdateDetail(payload, (result) => {
        message.success(result.msg)
        this.handleAddCancel()
      })
    } else {
      fetchModuleAdd(payload, (result) => {
        message.success(result.msg)
        this.handleAddCancel()
      })
    }
  }

  // 关闭新增/编辑按钮弹窗，并刷新按钮列表
  handleAddCancel() {
    this.setState({
      addButtonVisible: false,
      buttonEditData: {},
    }, () => {
      this.getButtonList()
    })
  }

  // 刷新按钮列表
  getButtonList = () => {
    this.setState({ buttonListLoading: true }, () => {
      fetchButtonList({ id: this.state.buttonMenuId }, (result) => {
        this.setState({
          buttonListLoading: false,
          buttonDataSource: result.data.list,
        })
      })
    })
  }

  // ===================== Render =====================

  render() {
    const {
      menuModal,
      buttonVisible, buttonParentId, buttonMenuId,
      addButtonVisible, buttonEditState, buttonEditData,
      buttonListLoading, buttonDataSource,
      tableListLoading, tableDataSource,
    } = this.state

    return (
      <div className="page page-scrollfix page-usermanage page-modulemanage">
        <Layout>
          <Layout className="page-body">
            <Content>
              <div className="page-content">
                <ModuleList
                  dataSource={tableDataSource}
                  loading={tableListLoading}
                  onDelete={this.handleDelete}
                  onModify={this.handleModify}
                  onUpdataStatus={this.handleChangeStatus}
                  onAddNode={this.handleAddNode}
                  buttonList={this.buttonList}
                />
              </div>
              <div className="page-footer">
                <div className="page-footer-buttons">
                  <Button type="primary" onClick={this.moduleAdd} > 新增模块</Button>
                </div>
              </div>
            </Content>
          </Layout>
        </Layout>
        {menuModal.visible && (
          <ModuleModal
            visible={menuModal.visible}
            title={menuModal.title}
            formType={menuModal.formType}
            parentId={menuModal.parentId}
            itemId={menuModal.itemId}
            initialValues={menuModal.initialValues}
            handleOk={this.handleOk}
            onCancel={this.handleCancel}
          />
        )}
        {buttonVisible && (
          <ButtonModal
            visible={buttonVisible}
            pid={buttonParentId}
            itemId={buttonMenuId}
            addButton={this.addButton}
            cancelButton={this.cancelButton}
            editButton={this.editButton}
            listLoading={buttonListLoading}
            dataSource={buttonDataSource}
            updateList={() => { this.getButtonList() }}
          />
        )}
        {addButtonVisible && (
          <AddButtonModal
            visible={addButtonVisible}
            title={buttonEditState === 'edit' ? '修改按钮权限' : '新增按钮权限'}
            state={buttonEditState}
            buttonEditData={buttonEditData}
            handleAdd={this.handleAdd}
            onCancel={this.handleAddCancel}
          />
        )}
      </div>
    )
  }
}
