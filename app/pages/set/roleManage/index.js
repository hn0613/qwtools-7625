import React, { useState, useEffect } from 'react';
import {
  Spin,
  Button,
  Popconfirm,
  Form,
  Input,
  Layout,
  Radio,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TableList from '@tableList';
import { menu } from '@apis/common';
import {
  fetchRoleList,
  fetchRoleDetail,
  fetchRoleDelete,
  fetchModuleListInRole,
  fetchUpdateRoleRes,
  fetchUserList,
  fetchRoleDeletePeople,
  fetchUpdateButton,
  fetchTreeList,
} from '@apis/manage';
import RolesList from './roleList';
import RolesModule from './roleModuleList';
import PeopleTree from './peopleTreeList';
import RoleEditModal from './modal/roleAdd';
import ButtonModal from './modal/buttonModal';

const FormItem = Form.Item;
const { Content, Sider } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Search } = Input;

export default function RoleManage() {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('stepTree')
  const [Visible, setVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('')
  const [currRoleId, setCurrRoleId] = useState('')
  const [modifyId, setModifyId] = useState('')
  const [spinloading, setSpinloading] = useState(true)
  const [tabsloading, setTabsloading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [treeloading, setTreeloading] = useState(false)
  const [searchKey, setSearchKey] = useState({
    roleName: '',
  })
  const [peopleSearchKey, setPeopleSearchKey] = useState({
    pageNo: 1,
    pageSize: 10,
  })
  const [pid, setPid] = useState('')
  const [itemId, setItemId] = useState('')
  const [buttonVisible, setButtonVisible] = useState(false)
  const [btnRights, setBtnRights] = useState({
    add: true,
    edit: true,
    deleteRole: true,
    deletePolice: true,
  })
  const [treeData, setTreeData] = useState([])
  const [roleType, setRoleType] = useState('')
  const [roleListResult, setRoleListResult] = useState({ list: [], loading: false })
  const [roleDetailManagResult, setRoleDetailManagResult] = useState({ list: [], loading: false })
  const [roleModuleListInRoleResult, setRoleModuleListInRoleResult] = useState({ list: [], loading: false })
  const [rolePeopleResult, setRolePeopleResult] = useState({ list: [], loading: false })
  const [resultCkecked, setResultCkecked] = useState('')
  const [checkedIdArr, setCheckedIdArr] = useState({})

  useEffect(() => {
    getData('init')
  }, [])

  const changeTab = (e) => {
    if (e.target.value === 'stepTree') {
      getTreeList()
    } else if (e.target.value === 'setmodules') {
      getRoleList()
    } else if (e.target.value === 'setpeoples') {
      getPeopleList()
    }
    setActiveTab(e.target.value)
  }

  const getData = (state, overrideRoleName) => {
    const params = overrideRoleName !== undefined ? { roleName: overrideRoleName } : { ...searchKey }
    setSpinloading(true)
    fetchRoleList(params, (result) => {
      setSpinloading(false)
      setRoleListResult(result.data)
      if (state === 'init') {
        if (result.data.list.length >= 1) {
          const roleId = result.data.list[0].id || -1
          setCurrRoleId(roleId)
          const type = result.data.list[0].type
          setRoleType(type)
          if (activeTab === 'stepTree') {
            getTreeList(roleId)
          } else if (activeTab === 'setmodules') {
            getRoleList(roleId)
          } else if (activeTab === 'setpeoples') {
            getPeopleList({ pageNo: 1, pageSize: peopleSearchKey.pageSize, roleId })
          }
        }
      }
    })
  }

  const getRoleDetail = (roleId) => {
    setTabsloading(true)
    fetchRoleDetail(
      { id: roleId !== undefined ? roleId : currRoleId },
      (res) => {
        setResultCkecked(res.data.resourceIds || [])
        setTabsloading(false)
        setRoleDetailManagResult(res.data)
      },
      (res) => {
        message.warning(res.msg)
        setTabsloading(false)
      },
    )
  }

  const getTreeList = (roleId) => {
    const id = roleId !== undefined ? roleId : currRoleId
    setTreeloading(true)
    fetchTreeList(
      { id },
      (res) => {
        const newCheckedIdArr = {}
        res.data &&
          res.data.list.map((data) => {
            hangdleButton(data, newCheckedIdArr)
          })
        setCheckedIdArr(newCheckedIdArr)
        setTreeloading(false)
        setTreeData(res.data.list)
      },
      (res) => {
        message.warning(res.msg)
        setTreeloading(false)
        setTreeData([])
      },
    )
  }

  const getRoleList = (roleId) => {
    const id = roleId !== undefined ? roleId : currRoleId
    fetchModuleListInRole({ id }, (res) => {
      const newCheckedIdArr = {}
      setRoleModuleListInRoleResult(res.data)
      const { list } = res.data
      list.map((data) => {
        hangdleButton(data, newCheckedIdArr)
      })
      setCheckedIdArr(newCheckedIdArr)
      getRoleDetail(id)
    })
  }

  const hangdleButton = (data, checkedIdArrObj) => {
    const checkedArr = []
    const checkedIdAll = []

    const buttonsList = data.buttons
    if (buttonsList && buttonsList.length > 0) {
      buttonsList.map((item) => {
        checkedArr.push(item.resName)
        checkedIdAll.push(item.id)
      })
      data.checkedArr = checkedArr.join(',')
      checkedIdArrObj[data.id] = checkedIdAll
    } else {
      data.checkedArr = ''
    }
    if (data.children && data.children.length > 0) {
      const { children } = data
      children.map((child) => {
        hangdleButton(child, checkedIdArrObj)
      })
    }
  }

  const getPeopleList = (params) => {
    const finalParams = params || { ...peopleSearchKey, roleId: currRoleId }
    setTableLoading(true)
    fetchUserList(
      finalParams,
      (res) => {
        setTableLoading(false)
        setRolePeopleResult(res.data)
      },
    )
  }

  const handleCurrentIndex = (id, type) => {
    setCurrRoleId(id)
    setRoleType(type)
    const nextSearch = { pageNo: 1, pageSize: peopleSearchKey.pageSize }
    setPeopleSearchKey(nextSearch)
    form.resetFields(['key'])
    if (activeTab === 'stepTree') {
      getTreeList(id)
    } else if (activeTab === 'setmodules') {
      getRoleList(id)
    } else if (activeTab === 'setpeoples') {
      getPeopleList({ ...nextSearch, roleId: id })
    }
  }

  const handleCheckModify = (values) => {
    setResultCkecked(values)
  }

  const editSave = () => {
    fetchUpdateRoleRes(
      { id: currRoleId, resourceIds: resultCkecked },
      (res) => {
        if (res.status === 1) {
          message.success(res.msg)
          menu({}, (response) => {
            sessionStorage.setItem('menu', JSON.stringify(response.data.list))
          })
        }
      },
    )
  }

  const roleAdd = () => {
    setVisible(true)
    setTitle('新增角色')
    setType('add')
  }

  const onRoleModify = (id) => {
    fetchRoleDetail({ id: id }, (result) => {
      setVisible(true)
      setTitle('修改角色')
      setType('modify')
      setModifyId(id)
      setRoleDetailManagResult(result.data)
    })
  }

  const handleRoleDelete = (id) => {
    fetchRoleDelete({ id: id }, (result) => {
      message.success(result.msg)
      getData('init')
    })
  }

  const handleRoleSearch = (value) => {
    setSearchKey({
      roleName: value,
    })
    getData(undefined, value)
  }

  const handleDelete = (id) => {
    fetchRoleDeletePeople({ id: id, roleId: currRoleId }, (result) => {
      message.success(result.msg)
      const isLastOnPage = rolePeopleResult.list && rolePeopleResult.list.length <= 1
      const canGoBack = isLastOnPage && peopleSearchKey.pageNo > 1
      if (canGoBack) {
        const nextSearch = { ...peopleSearchKey, pageNo: peopleSearchKey.pageNo - 1 }
        setPeopleSearchKey(nextSearch)
        getPeopleList({ ...nextSearch, roleId: currRoleId })
      } else {
        getPeopleList()
      }
    })
  }

  const handleSearch = (e) => {
    e.stopPropagation()
    const keyword = form.getFieldValue('key')
    const nextSearch = { ...peopleSearchKey, keyword, pageNo: 1 }
    setPeopleSearchKey(nextSearch)
    getPeopleList({ ...nextSearch, roleId: currRoleId })
  }

  const handleOk = () => {
    setVisible(false)
    fetchRoleList({}, (result) => {
      setSpinloading(false)
      setRoleListResult(result.data)
      if (result.data.list.length >= 1) {
        const roleId = result.data.list[0].id || -1
        setCurrRoleId(roleId)
        const type = result.data.list[0].type
        setRoleType(type)
        if (activeTab === 'stepTree') {
          getTreeList(roleId)
        } else if (activeTab === 'setmodules') {
          getRoleList(roleId)
        } else if (activeTab === 'setpeoples') {
          getPeopleList({ pageNo: 1, pageSize: peopleSearchKey.pageSize, roleId })
        }
      }
    })
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const pageChange = (newPage) => {
    const nextSearch = { ...peopleSearchKey, pageNo: newPage }
    setPeopleSearchKey(nextSearch)
    getPeopleList({ ...nextSearch, roleId: currRoleId })
  }

  const pageSizeChange = (e, pageSize) => {
    const nextSearch = { ...peopleSearchKey, pageNo: 1, pageSize }
    setPeopleSearchKey(nextSearch)
    getPeopleList({ ...nextSearch, roleId: currRoleId })
  }

  const buttonList = (id, parentid) => {
    setButtonVisible(true)
    setPid(parentid)
    setItemId(id)
    setTitle('模块按钮权限列表')
  }

  const cancelButton = () => {
    setButtonVisible(false)
  }

  const saveChecked = (selectedRowKeys) => {
    fetchUpdateButton(
      {
        id: currRoleId,
        resourceIds: selectedRowKeys,
        menuId: itemId,
      },
      (res) => {
        message.success(res.msg)
        getRoleList()
        cancelButton()
      },
    )
  }

  const renderColumn = () => {
    const configArr = [
      {
        title: '姓名',
        dataIndex: 'chineseName',
        key: 'chineseName',
        width: 200,
      },
      {
        title: '单位',
        dataIndex: 'deptName',
        key: 'deptName',
        width: 200,
      },
      {
        title: '职务',
        dataIndex: 'post',
        key: 'post',
        width: 200,
      },
      {
        title: '账号',
        dataIndex: 'username',
        key: 'username',
        width: 150,
      },
      {
        title: '操作',
        key: 'operate',
        width: 100,
        render: (text, record, index) =>
          (btnRights.deletePolice ? (
            <span className="blue">
              <Popconfirm
                title="删除?"
                placement="left"
                onConfirm={() => handleDelete(record.id)}
              >
                <a>删除</a>
              </Popconfirm>
            </span>
          ) : null),
      },
    ]
    if (sessionStorage.getItem('roleName') !== '0') {
    }
    return configArr
  }

  const returnContent = (key) => {
    if (key === 'setmodules') {
      return (
        <Spin spinning={tabsloading}>
          <RolesModule
            dataSource={roleModuleListInRoleResult.list}
            loading={roleModuleListInRoleResult.loading}
            checkedId={resultCkecked}
            onCheckModify={handleCheckModify}
            roleType={roleType}
            buttonList={buttonList}
          />
        </Spin>
      )
    } else if (key === 'setpeoples') {
      return (
        <div className="has-pagination table-flex flexcolumn">
          <Spin spinning={tableLoading}>
            <TableList
              rowKey="id"
              columns={renderColumn()}
              dataSource={rolePeopleResult.list}
              loading={rolePeopleResult.loading}
              currentPage={peopleSearchKey.pageNo}
              pageSize={peopleSearchKey.pageSize}
              scroll={{ y: true }}
              onChange={pageChange}
              onShowSizeChange={pageSizeChange}
              totalCount={rolePeopleResult.totalCount || 0}
            />
          </Spin>
          <div className="page-footer" />
        </div>
      )
    }
    if (key === 'stepTree') {
      return (
        <Spin spinning={treeloading}>
          <PeopleTree dataSource={treeData} />
        </Spin>
      )
    }
    return null
  }

  return (
    <div className="page page-scrollfix page-usermanage page-rolemanage">
      <Layout>
        <Layout className="page-body">
          <Sider
            width={240}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Spin spinning={spinloading}>
              <FormItem>
                <Search
                  style={{ width: '100%' }}
                  placeholder="搜索角色"
                  onSearch={handleRoleSearch}
                  addonAfter={
                    btnRights.add ? (
                      <PlusOutlined title="新增角色" onClick={roleAdd} />
                    ) : null
                  }
                />
              </FormItem>
              <div className="treeside">
                <RolesList
                  roles={roleListResult.list || []}
                  handleRoleDelete={handleRoleDelete}
                  onRoleModify={onRoleModify}
                  onCurrentIndex={handleCurrentIndex}
                  btnRights={btnRights}
                />
              </div>
            </Spin>
          </Sider>
          <Content>
            <div className="page-header">
              <div className="layout-between">
                <div className="left">
                  <Button
                    type="primary"
                    className={
                      activeTab === 'setpeoples' ||
                      activeTab === 'stepTree' ? (
                          'hide'
                        ) : null
                    }
                    onClick={editSave}
                  >
                    保存
                  </Button>
                  <div
                    className={
                      activeTab === 'setpeoples' ? 'page-search' : 'hide'
                    }
                  >
                    <Form form={form} className="flexrow">
                      <FormItem name="key">
                        <Input
                          className="input-base-width"
                          size="default"
                          placeholder="请输入关键字进行搜索"
                        />
                      </FormItem>
                      <Button type="primary" onClick={handleSearch}>
                        搜索
                      </Button>
                    </Form>
                  </div>
                </div>
                <div className="right">
                  <RadioGroup
                    onChange={changeTab}
                    defaultValue="stepTree"
                  >
                    <RadioButton value="stepTree">角色树</RadioButton>
                    <RadioButton value="setmodules">模块选择</RadioButton>
                    <RadioButton value="setpeoples">列表</RadioButton>
                  </RadioGroup>
                </div>
              </div>
            </div>
            <div className="page-content table-flex table-scrollfix">
              {returnContent(activeTab)}
            </div>
          </Content>
        </Layout>
      </Layout>
      {Visible ? (
        <RoleEditModal
          visible={Visible}
          title={title}
          onCancel={handleCancel}
          handleOk={handleOk}
          value={
            type === 'modify' ? (
              roleDetailManagResult
            ) : (
              { name: '', sort: '' }
            )
          }
          type={type}
          modifyId={modifyId}
        />
      ) : null}
      {buttonVisible ? (
        <ButtonModal
          title="按钮权限列表"
          visible={buttonVisible}
          pid={pid}
          itemId={itemId}
          cancelButton={cancelButton}
          saveChecked={saveChecked}
          checkedIdArr={checkedIdArr}
        />
      ) : null}
    </div>
  )
}
