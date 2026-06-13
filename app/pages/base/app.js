import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { message, ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { validateTickit, parseQueryString } from '@configs/common'
import { menu, staff, loginByKey } from '@apis/common'
import '@styles/base.less'

import Header from './app/header'
import LeftNav from './app/leftNav'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuStyle, setMenuStyle] = useState(false)
  const [leftNav, setLeftNav] = useState([])
  const [topMenuReskey, setTopMenuReskey] = useState('platformManage')
  const [gMenuList, setGMenuList] = useState([])
  const [idRenderChild, setIdRenderChild] = useState(false)
  const [isIframe, setIsIframe] = useState(false)

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem('menuStyle') === 'false') {
      setMenuStyle(false)
    }
    if (sessionStorage.getItem('menuStyle') === 'true') {
      setMenuStyle(true)
    }
  }, [])

  function init() {
    message.config({
      duration: 3,
    })

    const query = parseQueryString(window.location.href)

    if (query.mode === 'iframe' || query.key) {
      setIsIframe(true)
    }

    if (query.ticket) {
      validateTickit({ query, pathname: location.pathname }, () => {
        initMenuState()
        setIdRenderChild(true)
      })
    } else if (query.key) {
      loginByKey({}, () => {
        sessionStorage.setItem('key', query.key)
        Promise.all([
          new Promise((resolve, reject) => {
            menu({}, (response) => {
              const nav = response.data.list || []
              if (nav.length > 0) {
                sessionStorage.setItem('gMenuList', JSON.stringify(nav))
                sessionStorage.setItem('leftNav', JSON.stringify(nav))
                sessionStorage.setItem('topMenuReskey', nav[0].resKey)
              }
              resolve()
            }, () => reject())
          }),
          new Promise((resolve, reject) => {
            staff({}, (res) => {
              sessionStorage.setItem('userinfo', JSON.stringify(res.data))
              resolve()
            }, () => reject())
          }),
        ]).then(() => {
          initMenuState()
          setIdRenderChild(true)
        }).catch(() => {
          message.warning('初始化失败')
          sessionStorage.clear()
          navigate('/login')
        })
      }, () => {
        message.warning('key 验证失败')
        sessionStorage.clear()
        navigate('/login')
      })
    } else {
      initMenuState()
      setIdRenderChild(true)
    }
  }

  function initMenuState() {
    const menuList = JSON.parse(sessionStorage.getItem('gMenuList') || '[]')
    setGMenuList(menuList)
    setLeftNav(menuList)
    const storedTopMenuReskey = sessionStorage.getItem('topMenuReskey')
    if (storedTopMenuReskey) {
      setTopMenuReskey(storedTopMenuReskey)
    }
    getMenuId(menuList, location.pathname.replace('/', ''))
  }

  function getMenuId(nav, pathname) {
    let topMenuReskeyFlag = ''
    let topMenuReskeyChild = []
    let flag = false

    if (nav && nav.length > 0) {
      compare(nav, pathname)
    }

    function compare(children, pathname) {
      children.map((item) => {
        if (item.resKey.indexOf('platform') > -1) {
          if (!flag && (sessionStorage.getItem('topMenuReskey') !== 'set$')) {
            topMenuReskeyFlag = item.resKey
            topMenuReskeyChild = item.children
          }
        }
        const _resKey = `${item.resKey.replace(/[\$\.\?\+\^\[\]\(\)\{\}\|\\\/]/g, '\\$&').replace(/\*\*/g, '[\\w|\\W]+').replace(/\*/g, '[^\\/]+')}$`
        if (new RegExp(_resKey).test(pathname)) {
          flag = true
          sessionStorage.setItem('menuId', item.id)
          sessionStorage.setItem('topMenuReskey', topMenuReskeyFlag)
          setTopMenuReskey(topMenuReskeyFlag)
        } else if (item.children) {
          compare(item.children, pathname)
        }
      })
    }
  }

  function changeMenuStyle(val) {
    setMenuStyle(val)
    sessionStorage.setItem('menuStyle', val)
  }

  function topMenuClick(item, index) {
    if (!item.children) {
      message.info('顶级菜单至少要有一个下级菜单')
      return
    }
    sessionStorage.setItem('topMenuReskey', item.resKey)
    setTopMenuReskey(item.resKey)

    if (item.resKey === 'controlCenter') {
      let hasIndex = false
      item.children.map((i) => {
        if (i.resKey === 'screen$/default') {
          hasIndex = true
        }
      })
      if (hasIndex) {
        navigate(item.children[0].resKey)
      } else {
        navigate('mission$/my$')
      }
    } else if (item.children[0] && item.children[0] && item.children[0].children && item.children[0].children[0]) {
      navigate(item.children[0].children[0].resKey)
    } else {
      navigate(item.children[0].resKey)
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      {!idRenderChild ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div id="container">
          {!isIframe && (
            <Header
              gMenuList={gMenuList}
              topMenuClick={topMenuClick}
              topMenuReskey={topMenuReskey}
            />
          )}
          <div className={isIframe ? 'boxed isIframe' : 'boxed'}>
            <div className={menuStyle ? 'boxed boxed-mini' : 'boxed'}>
              <div id="content-container" className="content-container">
                <div id="page-content">
                  <Outlet />
                </div>
              </div>
            </div>
            <LeftNav
              location={location}
              leftNavMode={changeMenuStyle}
              menuStyle={menuStyle}
              leftNav={leftNav}
              topMenuReskey={topMenuReskey}
            />
          </div>
        </div>
      )}
    </ConfigProvider>
  )
}
