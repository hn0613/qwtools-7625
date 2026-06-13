import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Menu, Button, Modal, message, Row, Col, Dropdown } from 'antd'
import { brandName } from '@config'
import { logout } from '@apis/common'
import { clearTabList } from '@actions/tabList'

import EditPassword from './modal/editPassword'
import UserInfo from './modal/userInfo'

const { confirm } = Modal

function Header({ gMenuList, topMenuClick, topMenuReskey }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [userInfo, setUserInfo] = useState(false)
  const [editPasswordMadalIsOpen, setEditPasswordMadalIsOpen] = useState(false)

  function handleLogout() {
    confirm({
      title: '提示',
      content: '确认退出登录吗？',
      onOk() {
        logout({}, (result) => {
          if (result.status === 1) {
            dispatch(clearTabList())
            sessionStorage.clear()
            navigate('/login')
          } else {
            message.warning(result.msg)
          }
        })
      },
    })
  }

  function cancel() {
    setEditPasswordMadalIsOpen(false)
  }

  function handleOk() {
    setEditPasswordMadalIsOpen(false)
  }

  function editPasswordOpen() {
    setEditPasswordMadalIsOpen(true)
  }

  function getUserInfo() {
    setUserInfo(true)
  }

  function onCancel() {
    setUserInfo(false)
  }

  function logoClick() {
  }

  const userinfo = JSON.parse(sessionStorage.getItem('userinfo')) || {}
  const roles = []
  userinfo && userinfo.roles && userinfo.roles.map((item) => {
    roles.push(item.roleName)
  })
  let name = ''
  if (sessionStorage.getItem('userinfo')) {
    name = JSON.parse(sessionStorage.getItem('userinfo')).chineseName
  }

  const userCenterItems = [
    {
      key: '1',
      label: (
        <span>
          <span className="label">角色： </span>
          <span className="value" title={roles.join(',')}>{roles.join(',') || '---'}</span>
        </span>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      label: (
        <span>
          <span className="label">警号： </span>
          <span className="value">{userinfo.policeCode || '---'}</span>
        </span>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      label: (
        <span>
          <span className="label">职务： </span>
          <span className="value">{userinfo.duty || '---'}</span>
        </span>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: (
        <Row>
          <Col span={12}>
            <Button type="primary" size="small" onClick={editPasswordOpen}>修改密码</Button>
          </Col>
          <Col span={12}>
            <Button type="primary" size="small" onClick={handleLogout}>退出登录</Button>
          </Col>
        </Row>
      ),
    },
  ]

  const topKey = topMenuReskey

  return (
    <header id="navbar">
      <div id="navbar-container" className="boxed">
        <Row className="row">
          <Col span={20}>
            <div className="navbar-brand" title={brandName} onClick={logoClick}>
              <span className="brand-title">
                <span className="brand-text"><span className="logo" />{brandName}</span>
              </span>
            </div>
            <nav className="topMenus hide">
              {
                gMenuList && gMenuList.map((item, index) => (
                  <span
                    className={item.resKey === topKey ? 'topMenu on' : 'topMenu'}
                    key={index}
                    onClick={() => topMenuClick(item, index)}
                  >{item.resName}</span>
                ))
              }
            </nav>
          </Col>
          <Col span={4} className="col">
            <div className="right">
              <ul>
                <li>
                  <a onClick={() => getUserInfo()}>{name}</a>
                </li>
                <li>
                  <a onClick={handleLogout}>退出</a>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </div>
      {editPasswordMadalIsOpen && (
        <EditPassword
          handleOk={handleOk}
          visible={editPasswordMadalIsOpen}
          onCancel={cancel}
        />
      )}
      {userInfo && (
        <UserInfo
          onCancel={() => onCancel()}
          handleLogout={handleLogout}
        />
      )}
    </header>
  )
}

export default Header
