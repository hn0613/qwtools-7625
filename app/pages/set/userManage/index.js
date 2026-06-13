import React, { useState, useEffect } from 'react';
import {
  Spin,
  notification,
  Button,
  Popconfirm,
  Form,
  Input,
  message,
  Layout,
} from 'antd';
import TableList from '@tableList';
import { synUser } from '@apis/common';
import {
  fetchUserDepttList,
  fetchUserList,
  fetchUserDetail,
  fetchUserDelete,
  fetchRoleList,
  fetchChangeUserStatus,
} from '@apis/manage';
import TreeList from './treeList';
import AddPolice from './modal/addPolice';
import SelectRole from './modal/selectRole';
import { fetchBtns } from '@configs/common';

const FormItem = Form.Item;
const { Content, Sider } = Layout;

export default function UserManage() {
  const [form] = Form.useForm()
  const [searchtitle, setSearchtitle] = useState('')
  const [PoliceAddVisible, setPoliceAddVisible] = useState(false)
  const [synchronizeLoading, setSynchronizeLoading] = useState(false)
  const [RoleVisible, setRoleVisible] = useState(false)
  const [spinloading, setSpinloading] = useState(true)
  const [moduletitle, setModuletitle] = useState('')
  const [moduletype, setModuletype] = useState('')
  const [currPeopleId, setCurrPeopleId] = useState('')
  const [roleEditRecord, setRoleEditRecord] = useState(null)
  const [searchKey, setSearchKey] = useState({
    keyword: '',
    pageSize: 10,
    pageNo: 1,
    deptCode: '',
  })
  const [btnRights, setBtnRights] = useState({
    view: true,
    freeze: true,
    delete: true,
    edit: true,
    add: true,
  })
  const [userDeptResult, setUserDeptResult] = useState({ list: [], loading: false })
  const [userListResult, setUserListResult] = useState({ list: [], loading: false })
  const [userDetailResult, setUserDetailResult] = useState({ list: [], loading: false })
  const [userRoleSetResult, setUserRoleSetResult] = useState({ list: [], loading: false })

  const getData = (key) => {
    fetchUserList(key, (res) => {
      setUserListResult(res.data)
    })
  }

  useEffect(() => {
    fetchRoleList({}, (res) => {
      setUserRoleSetResult(res.data)
    })
    fetchUserDepttList({}, (res) => {
      if (res.data.list.length > 0) {
        setSearchKey({
          ...searchKey,
          deptCode: res.data.list[0].deptCode,
        })
        setUserDeptResult(res.data)
        setSpinloading(false)
        setSearchtitle('杭州市')
        getData({
          ...searchKey,
          deptCode: res.data.list[0].deptCode,
        })
      } else {
        setSpinloading(false)
      }
    })
    form.setFieldsValue({ key: '' })
  }, [])

  const handleChangeStatus = (id, status) => {
    fetchChangeUserStatus({ id: id, status: status }, (res) => {
      message.success(res.msg)
      getData(searchKey)
    }, (res) => {
      message.error(res.msg || '操作失败，请重试')
    })
  }

  const handleRoleEdit = (record) => {
    if (!userRoleSetResult.list || userRoleSetResult.list.length === 0) {
      message.warning('暂无可分配角色')
      return
    }
    const currentRoleIds = (record.roles || []).map(item => item.id)
    setRoleEditRecord({ id: record.id, currentRoleIds })
    setRoleVisible(true)
  }

  const handleRoleOk = () => {
    setRoleVisible(false)
    setRoleEditRecord(null)
    getData(searchKey)
  }

  const handleRoleCancel = () => {
    setRoleVisible(false)
    setRoleEditRecord(null)
  }

  const handleDelete = (id) => {
    fetchUserDelete({ id }, (res) => {
      message.success(res.msg)
      const newPage = (userListResult.list.length <= 1 && searchKey.pageNo > 1)
        ? searchKey.pageNo - 1
        : searchKey.pageNo
      const newKey = { ...searchKey, pageNo: newPage }
      setSearchKey(newKey)
      getData(newKey)
    }, (res) => {
      message.error(res.msg || '删除失败，请重试')
    })
  }

  const handleUserInfo = (id) => {
    fetchUserDetail({ id: id }, (res) => {
      setUserDetailResult(res.data)
      setPoliceAddVisible(true)
      setModuletype('edit')
      setModuletitle('详情')
      setCurrPeopleId(id)
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const keyword = form.getFieldValue('key')
    setSpinloading(true)
    setSearchKey({
      ...searchKey,
      keyword: keyword,
      pageNo: 1,
    })
    getData({
      ...searchKey,
      keyword: keyword,
      pageNo: 1,
    })
    setTimeout(() => {
      setSpinloading(false)
    }, 500)
  }

  const onSelect = (info, title) => {
    if (info && info.length > 0) {
      setSpinloading(true)
      setSearchtitle(title)
      setSearchKey({
        ...searchKey,
        deptCode: info[0],
        pageNo: 1,
        keyword: '',
      })
      getData({
        ...searchKey,
        deptCode: info[0],
        pageNo: 1,
        keyword: '',
      })
      form.setFieldsValue({ key: '' })
      setTimeout(() => {
        setSpinloading(false)
      }, 500)
    }
  }

  const policeAdd = () => {
    if (searchKey.deptCode) {
      setPoliceAddVisible(true)
      setModuletype('add')
      setModuletitle('新增')
    } else {
      notification.error({
        message: '错误',
        description: '请先选择部门',
      })
    }
  }

  const synchronize = () => {
    message.info('用户数据同步中')
    setSynchronizeLoading(true)
    synUser(
      {},
      () => {
        message.success('用户数据同步完成')
        setSynchronizeLoading(false)
        getData(searchKey)
      },
      (res) => {
        message.warning(res.msg)
        setSynchronizeLoading(false)
      },
    )
  }

  const handleOk = () => {
    const curUserListResult = userListResult
    let curpage = searchKey.pageNo
    if (
      moduletype === 'add' &&
      curUserListResult &&
      curUserListResult.totalCount > 0 &&
      curUserListResult.totalCount % 10 === 0
    ) {
      curpage += 1
    }
    setPoliceAddVisible(false)
    setSearchKey({
      ...searchKey,
      pageNo: curpage,
    })
    getData({
      ...searchKey,
      pageNo: curpage,
    })
  }

  const handleCancel = () => {
    setPoliceAddVisible(false)
  }

  const pageChange = (newPage) => {
    setSearchKey({
      ...searchKey,
      pageNo: newPage,
    })
    getData({
      ...searchKey,
      pageNo: newPage,
    })
  }

  const pageSizeChange = (e, pageSize) => {
    setSearchKey({
      ...searchKey,
      pageNo: 1,
      pageSize: pageSize,
    })
    getData({
      ...searchKey,
      pageNo: 1,
      pageSize: pageSize,
    })
  }

  const renderColumn = () => {
    return [
      {
        title: '姓名',
        dataIndex: 'chineseName',
        key: 'chineseName',
        width: '15%',
      },
      {
        title: '职务',
        dataIndex: 'post',
        key: 'post',
        width: '15%',
      },
      {
        title: '帐号',
        dataIndex: 'username',
        key: 'username',
        width: '15%',
      },
      {
        title: '帐号状态',
        dataIndex: 'statusLabel',
        key: 'statusLabel',
        width: '15%',
        render: (text, record, index) => (
          <span>{record.status ? '已冻结' : '正常'}</span>
        ),
      },
      {
        title: '角色',
        dataIndex: 'roles',
        key: 'roles',
        width: '20%',
        render: (text, record, index) => {
          const roleNames = []
          ;(text || []).map((item) => {
            roleNames.push(item.roleName)
          })
          return roleNames.length === 0 ? '' : roleNames.join(',')
        },
      },
      {
        title: '操作',
        key: 'operate',
        render: (text, record, index) => {
          return (
            <span>
              {btnRights.view ? (
                <span>
                  <a onClick={() => handleUserInfo(record.id)}>详情</a>
                  <span className="ant-divider" />
                </span>
              ) : null}
              {btnRights.edit ? (
                <span>
                  <a onClick={() => handleRoleEdit(record)}>修改角色</a>
                  <span className="ant-divider" />
                </span>
              ) : null}
              {btnRights.freeze ? (
                <span>
                  <Popconfirm
                    title={`确认${record.status ? '解冻' : '冻结'}账户?`}
                    placement="left"
                    onConfirm={() => handleChangeStatus(record.id, `${record.status}`)}
                  >
                    <a>{record.status ? '解冻账户' : '冻结账户'}</a>
                  </Popconfirm>
                  <span className="ant-divider" />
                </span>
              ) : null}
              {btnRights.delete ? (
                <Popconfirm
                  title="确认删除该用户？删除后不可恢复。"
                  placement="left"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <a style={{ color: '#ff4d4f' }}>删除</a>
                </Popconfirm>
              ) : null}
            </span>
          )
        },
      },
    ]
  }

  const thevalue = moduletype === 'add' ? '' : userDetailResult

  return (
    <div className="page page-scrollfix page-usermanage">
      <Layout>
        <Layout className="page-body">
          <Sider
            width={240}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Spin spinning={spinloading}>
              <h3 className="page-title">杭州市</h3>
              <div className="treeside">
                <TreeList
                  trees={userDeptResult.list}
                  curDeptCode={searchKey.deptCode}
                  onSelect={onSelect}
                />
              </div>
            </Spin>
          </Sider>
          <Content>
            <h3 className="page-title">
              {searchtitle}
              <span className="error">
                {' '}
                {userListResult.totalCount ? userListResult.totalCount : 0}
              </span>人
            </h3>
            <div className="page-header">
              <div className="layout-between">
                <Form form={form} className="flexrow" onFinish={handleSearch}>
                  <FormItem name="key">
                    <Input
                      className="input-base-width"
                      size="default"
                      placeholder="请输入关键字进行搜索"
                    />
                  </FormItem>
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                </Form>
              </div>
            </div>
            <div className="page-content has-pagination table-flex table-scrollfix">
              <TableList
                rowKey="id"
                columns={renderColumn()}
                dataSource={userListResult.list}
                currentPage={searchKey.pageNo}
                pageSize={searchKey.pageSize}
                loading={userListResult.loading}
                scroll={{ y: true }}
                onChange={pageChange}
                onShowSizeChange={pageSizeChange}
                totalCount={userListResult.totalCount}
              />
            </div>
            <div className="page-footer">
              <div className="page-footer-buttons">
                {btnRights.add ? (
                  <Button
                    type="primary"
                    style={{ marginRight: '10px' }}
                    onClick={() => policeAdd()}
                  >
                    {' '}
                    新增人员
                  </Button>
                ) : null}
                {btnRights.add ? (
                  <Button
                    type="primary"
                    loading={synchronizeLoading}
                    onClick={() => synchronize()}
                  >
                    {' '}
                    同步人员
                  </Button>
                ) : null}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>

      {PoliceAddVisible ? (
        <AddPolice
          visible={PoliceAddVisible}
          title={moduletitle}
          handleOk={handleOk}
          values={thevalue}
          deptId={searchKey.deptCode}
          currPeopleId={currPeopleId}
          type={moduletype}
          onCancel={handleCancel}
          roleList={userRoleSetResult.list || []}
        />
      ) : null}

      {RoleVisible && roleEditRecord ? (
        <SelectRole
          visible={RoleVisible}
          onCancel={handleRoleCancel}
          roleList={userRoleSetResult.list || []}
          currentRoleIds={roleEditRecord.currentRoleIds}
          userId={roleEditRecord.id}
          onOk={handleRoleOk}
        />
      ) : null}
    </div>
  )
}
