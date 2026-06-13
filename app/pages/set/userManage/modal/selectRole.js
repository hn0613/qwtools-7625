
import React, { useState, useEffect } from 'react'
import { Button, Modal, Select, message } from 'antd'
import { fetchUserSetRole } from '@apis/manage'

const { Option } = Select

export default function SelectRole({ visible, onCancel, roleList, currentRoleIds, userId, onOk }) {
  const [loading, setLoading] = useState(false)
  const [selectedRoleIds, setSelectedRoleIds] = useState([])

  useEffect(() => {
    if (visible) {
      setSelectedRoleIds((currentRoleIds || []).map(id => String(id)))
    }
  }, [visible])

  const handleSubmit = () => {
    if (selectedRoleIds.length === 0) {
      message.warning('请至少选择一个角色')
      return
    }
    setLoading(true)
    fetchUserSetRole(
      { id: userId, roleIds: selectedRoleIds },
      (res) => {
        message.success(res.msg)
        setLoading(false)
        onOk()
      },
      (res) => {
        message.error(res.msg || '角色修改失败，请重试')
        setLoading(false)
      },
    )
  }

  const hasRoles = roleList && roleList.length > 0

  const footer = (
    <div>
      <Button type="primary" onClick={handleSubmit} loading={loading} disabled={!hasRoles}>确定</Button>
      <Button onClick={onCancel}>取消</Button>
    </div>
  )

  return (
    <Modal
      open={visible}
      title="修改角色"
      onCancel={onCancel}
      footer={footer}
      className="modal-header modal-body"
    >
      {hasRoles ? (
        <Select
          mode="multiple"
          placeholder="请选择用户的角色"
          showSearch
          style={{ width: '100%' }}
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
        >
          {roleList.map(item => (
            <Option key={item.roleName} value={`${item.id}`}>{item.roleName}</Option>
          ))}
        </Select>
      ) : (
        <span style={{ color: '#999' }}>暂无可分配角色</span>
      )}
    </Modal>
  )
}
