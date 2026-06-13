import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin, Form, Input, Button, Row, Col, message } from 'antd'
import { regExpConfig } from '@reg'
import { brandName } from '@config'
import { clearGformCache2 } from '@actions/common'
import { menu, staff, login } from '@apis/common'
import Logo from '@components/logo/logo'
import md5 from 'md5'

import '@styles/login.less'

function Login() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(true)

  function handleSubmit(values) {
    form.validateFields().then((formValues) => {
      setLoading(true)
      formValues.password = md5(formValues.password)
      login(formValues, (res) => {
        sessionStorage.setItem('token', res.data.token)
        sessionStorage.setItem('ticket', res.data.ticket)
        menu({}, (response) => {
          const nav = response.data.list || []
          if (nav && nav[0]) {
            sessionStorage.setItem('gMenuList', JSON.stringify(nav))
            sessionStorage.setItem('topMenuReskey', nav[0].resKey)
            sessionStorage.setItem('leftNav', JSON.stringify(nav))

            staff({ usercode: formValues.username }, (resp) => {
              sessionStorage.setItem('userinfo', JSON.stringify(resp.data))
              navigate('/')
            }, (r) => {
              message.warning(r.msg)
              setLoading(false)
            })
          }
        }, (r) => {
          setLoading(false)
        })
      }, (res) => {
        message.warning(res.msg)
        setLoading(false)
      })
    }).catch(() => {
      message.error('请检查输入信息')
      setLoading(false)
    })
  }

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="extraLink" />
      <div className="flexcolumn" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="login-header" key="header" style={{ flex: 3, background: '#2d333e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', letterSpacing: '10px', position: 'relative' }}>
          <div className="slogan" style={{ position: 'absolute', zIndex: 1000, bottom: '40px', marginTop: '-10px', width: '100%', left: 0 }}>
            <div className="flexcolumn">
              {show ? [
                <p key="0" className="title" style={{ fontSize: '50px' }}>{brandName}</p>,
              ] : null}
            </div>
          </div>
          <Logo />
        </div>
        <div className="login-main" style={{ flex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div>
            {show ? [
              <Row key="row0">
                <Col span={8} />
                <Col span={8}>
                  <Spin spinning={loading}>
                    <Form
                      form={form}
                      onFinish={(values) => {
                        handleSubmit(values)
                      }}
                      initialValues={{ username: 'username', password: '123456' }}
                    >
                      <Form.Item name="username" rules={[
                        {
                          required: true, min: 4, max: 10, message: '用户名为4-10个字符',
                        },
                        { pattern: regExpConfig.policeNo, message: '账号4-10位数字或字母组成' },
                      ]}>
                        <Input placeholder="请输入用户名" type="text" />
                      </Form.Item>
                      <Form.Item name="password" rules={[
                        {
                          required: true, min: 6, max: 16, message: '密码为6-16个字符',
                        },
                        { pattern: regExpConfig.pwd, message: '密码由6-16位数字或者字母组成' },
                      ]}>
                        <Input placeholder="请输入密码" type="password" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" className="cert-btn">登录</Button>
                      </Form.Item>
                    </Form>
                  </Spin>
                </Col>
                <Col span={8} />
              </Row>,
            ] : null}
          </div>
        </div>
        <div className="login-footer">
          {show ? [
            <p key="0"> 浙江xxxxxxxxxx有限公司 </p>,
          ] : null}
        </div>
      </div>
    </div>
  )
}

export default Login
