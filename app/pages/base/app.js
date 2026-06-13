import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { message, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { validateTickit } from '@configs/common'
import { menu, staff, loginByKey } from '@apis/common'
import { updateTabList } from '@actions/tabList'
import '@styles/base.less'

import Header from './app/header'
import LeftNav from './app/leftNav'
import TabList from './app/tabList'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [menuStyle, setMenuStyle] = useState(false)
  const [leftNav, setLeftNav] = useState([])
  const [topMenuReskey, setTopMenuReskey] = useState('platformManage')
  const [gMenuList, setGMenuList] = useState([])
  const [idRenderChild, setIdRenderChild] = useState(false)
  const [isIframe, setIsIframe] = useState(false)

  function getRouteTitle(pathname) {
    if (pathname === '/' || pathname === '/desk$/index') return '首页'
    const key = pathname.replace(/^\//, '')
    const menuData = [
      ...(JSON.parse(sessionStorage.getItem('gMenuList')) || []),
      ...(JSON.parse(sessionStorage.getItem('leftNav')) || []),
    ]
    function findTitle(items) {
      for (const item of items) {
        if (item.resKey === key) return item.resName
        if (item.children) {
          const found = findTitle(item.children)
          if (found) return found
        }
      }
      return null
    }
    return findTitle(menuData) || key.split('/').pop().replace(/\$/g, '')
  }

  useEffect(() => {
    const pathname = location.pathname
    const tabKey = (pathname === '/desk$/index') ? '/' : pathname
    const isHome = tabKey === '/'
    dispatch(updateTabList({
      key: tabKey,
      title: getRouteTitle(pathname),
      closable: !isHome,
    }))
  }, [location.pathname])

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
        setIdRenderChild(true)
      })
    } else if (query.key) {
      loginByKey({}, (res) => {
        sessionStorage.setItem('key', query.key)
        setIdRenderChild(true)
      })
    } else {
      setGMenuList(JSON.parse(sessionStorage.getItem('gMenuList')))
      getMenuId(JSON.parse(sessionStorage.getItem('gMenuList')), location.pathname.replace('/', ''))
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

  function parseQueryString(url) {
    const obj = {}
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1]
      const strs = str.split('&')
      strs.map((item, i) => {
        const arr = strs[i].split('=')
        obj[arr[0]] = arr[1]
      })
    }
    return obj
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
              {idRenderChild && !isIframe && <TabList />}
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
