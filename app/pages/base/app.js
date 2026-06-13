import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { message, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { validateTickit, parseQueryString, _fetchStaff, _fetchNav } from '@configs/common'
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
    if (query.ticket) {
      validateTickit({ query, pathname: location.pathname }, (res) => {
        setGMenuList(JSON.parse(sessionStorage.getItem('gMenuList')))
        getMenuId(JSON.parse(sessionStorage.getItem('gMenuList')), location.pathname.replace('/', ''))
        setTopMenuReskey(sessionStorage.getItem('topMenuReskey'))
        setIdRenderChild(true)
      })
    } else if (query.key) {
      loginByKey({}, async (res) => {
        sessionStorage.setItem('key', query.key)
        sessionStorage.setItem('token', query.key)
        try {
          await Promise.all([_fetchStaff(), _fetchNav(location.pathname)])
        } catch (e) {
          sessionStorage.clear()
          message.error(e.message || '登录初始化失败')
          window.location.replace('/login')
          return
        }
        setGMenuList(JSON.parse(sessionStorage.getItem('gMenuList')))
        getMenuId(JSON.parse(sessionStorage.getItem('gMenuList')), location.pathname.replace('/', ''))
        setTopMenuReskey(sessionStorage.getItem('topMenuReskey'))
        setIdRenderChild(true)
      }, (res) => {
        message.error(res.msg || 'key 验证失败')
        window.location.replace('/login')
      })
    } else {
      const storedMenu = sessionStorage.getItem('gMenuList')
      if (!storedMenu) {
        sessionStorage.clear()
        window.location.replace('/login')
        return
      }
      setGMenuList(JSON.parse(storedMenu))
      getMenuId(JSON.parse(storedMenu), location.pathname.replace('/', ''))
      if (topMenuReskey !== sessionStorage.getItem('topMenuReskey')) {
        setTopMenuReskey(sessionStorage.getItem('topMenuReskey'))
      }
      setIdRenderChild(true)
    }

    if (query.mode === 'iframe' || query.key) {
      setIsIframe(true)
    } else {
      setIsIframe(false)
    }
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
      <div id="container">
        {idRenderChild && !isIframe && (
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
                {idRenderChild ? <Outlet /> : null}
              </div>
            </div>
          </div>
          {idRenderChild && (
            <LeftNav
              location={location}
              leftNavMode={changeMenuStyle}
              menuStyle={menuStyle}
              leftNav={leftNav}
              topMenuReskey={topMenuReskey}
            />
          )}
        </div>
      </div>
    </ConfigProvider>
  )
}
