import React, { useState, useEffect } from 'react'
import { Modal, Select, Button, message } from 'antd'
import { fetchUserSetRole } from '@apis/manage'

const { Option } = Select

export default function SelectRole({ visible, onCancel, handleOk, roleList, currentRoleIds, userId }) {
  const [loading, setLoading] = useState(false)
  const [selectedRoleIds, setSelectedRoleIds] = useState([])

  useEffect(() => {
    if (visible) {
      setSelectedRoleIds((currentRoleIds || []).map(id => String(id)))
    }
  }, [visible, currentRoleIds])

  const handleChange = (values) => {
    setSelectedRoleIds(values)
  }

  const handleSubmit = () => {
    if (!roleList || roleList.length === 0) {
      message.warning('暂无可分配角色，无法提交')
      return
    }
    setLoading(true)
    fetchUserSetRole({
      roleid: selectedRoleIds.join(','),
      id: userId,
    }, (res) => {
      message.success(res.msg)
      setLoading(false)
      handleOk()
    }, (errorRes) => {
      message.warning(errorRes.msg || '操作失败，请重试')
      setLoading(false)
    })
  }

  const footer = (
    <div>
      <Button
        type="primary"
        onClick={handleSubmit}
        loading={loading}
        disabled={!roleList || roleList.length === 0}
      >
        确定
      </Button>
      <Button onClick={onCancel}>取消</Button>
    </div>
  )

  const hasRoles = roleList && roleList.length > 0

  return (
    <Modal
      open={visible}
      title="修改角色"
      onCancel={onCancel}
      footer={footer}
      destroyOnClose
    >
      {!hasRoles ? (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#999' }}>
          暂无可分配角色
        </div>
      ) : (
        <div style={{ padding: '10px 0' }}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="请选择用户角色"
            value={selectedRoleIds}
            onChange={handleChange}
            showSearch
            optionFilterProp="children"
          >
            {roleList.map(item => (
              <Option key={String(item.id)} value={String(item.id)}>
                {item.roleName}
              </Option>
            ))}
          </Select>
        </div>
      )}
    </Modal>
  )
}
