import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { message, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { validateTickit } from '@configs/common'
import { getRouteTitle, isExcludedPath } from '@configs/routeConfig'
import { updateTabList } from '@actions/tabList'
import { menu, staff, loginByKey } from '@apis/common'
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

  // 监听路由变化，自动创建或激活页签
  useEffect(() => {
    if (!idRenderChild) return
    const { pathname } = location
    // 排除登录、404 等不进入页签体系的路径
    if (isExcludedPath(pathname)) return
    // 获取路径对应的页面标题，未知路径不创建页签
    const title = getRouteTitle(pathname)
    if (!title) return
    // 用去掉前导斜杠的路径作为页签 key（与菜单 resKey 保持一致）
    const key = pathname.replace(/^\//, '')
    dispatch(updateTabList({ key, title }))
  }, [location.pathname, idRenderChild, dispatch])

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
        {idRenderChild && !isIframe && <TabList />}
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
