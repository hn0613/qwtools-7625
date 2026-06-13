import { message } from 'antd'
import { loginByTicket, staff, login as loginApi, getBtns, menu } from '@apis/common'

export function parseQueryString(url) {
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

/* --------------验证ticket并获取用户信息和菜单信息 --------------*/
const _fetchLoginByTicket = ticket => new Promise((resolve, reject) => {
  loginByTicket({ ticket }, (response) => {
    resolve(response.data)
  }, () => {
    message.warning('登录过期或服务不可用')
    reject()
  })
})

const _fetchStaff = () => new Promise((resolve, reject) => {
  staff({}, (res) => {
    sessionStorage.setItem('userinfo', JSON.stringify(res.data))
    resolve()
  }, () => {
    reject()
  })
})

export const isHasCurrentMenu = (allMenu, pathname) => compare(allMenu, pathname)

const _fetchNav = () => new Promise((resolve, reject) => {
  menu({}, (response) => {
    const { list } = response.data
    if (!list || list.length === 0) {
      message.warning('该账户没有任何菜单权限，请联系管理员')
      reject()
      return
    }
    sessionStorage.setItem('gMenuList', JSON.stringify(list))
    sessionStorage.setItem('leftNav', JSON.stringify(list))
    if (list[0]) {
      sessionStorage.setItem('topMenuReskey', list[0].resKey)
    }
    resolve()
  }, () => {
    reject()
  })
})

export const validateTickit = async function validateTickit({ query, pathname }, callback) {
  try {
    const { ticket } = query
    if (ticket) {
      const loginInfo = await _fetchLoginByTicket(ticket)
      sessionStorage.setItem('token', loginInfo.token)
    }
    await Promise.all([_fetchStaff(), _fetchNav()])
    if (typeof callback === 'function') callback()
  } catch (e) {
    sessionStorage.clear()
    window.location.href = '/login'
  }
}

function compare(children, pathname) {
  for (let i = 0; i < children.length; i += 1) {
    const item = children[i]
    const _resKey = `${item.resKey.replace(/[\$\.\?\+\^\[\]\(\)\{\}\|\\\/]/g, '\\$&').replace(/\*\*/g, '[\\w|\\W]+').replace(/\*/g, '[^\\/]+')}$`
    if (new RegExp(_resKey).test(pathname)) {
      sessionStorage.setItem('menuId', item.id)
      return true
    } else if (item.children) {
      if (compare(item.children, pathname)) return true
    }
  }
  return false
}

export const getMenuId = (navs, pathname) => {
  if (navs && navs.length > 0) {
    compare(navs, pathname)
  }
}

export const login = (params, success, failure) => {
  loginApi(params, (response) => {
    sessionStorage.setItem('token', response.data.token)
    localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage))
    if (typeof success === 'function') success(response)
  }, (response) => {
    if (typeof failure === 'function') failure(response)
  })
}

export const fetchBtns = (component, cb) => {
  getBtns({ id: sessionStorage.getItem('menuId') }, (res) => {
    const result = {}
    res.data.list.map((item) => {
      result[item.resKey] = true
    })
    typeof (cb) === 'function' ? cb(result) : ''
  })
}

export const isLogin = (nextState, replaceState) => {
  if (nextState.location.query && nextState.location.query.ticket) {
    sessionStorage.setItem('token', 'ticket')
  }
  if (nextState.location.query && nextState.location.query.key) {
    sessionStorage.setItem('token', 'key')
  }
  const token = sessionStorage.getItem('token')
  if (!token) {
    replaceState('/login')
  }
}

export const createAjaxAction = (createdApi, startAction, endAction) => (request = {}, resolve, reject, config) => (dispatch) => {
  if (startAction) dispatch(startAction({ req: request, res: {} }))
  const _resolve = (response) => {
    if (endAction) dispatch(endAction({ req: request, res: response }))
    if (resolve) resolve(response)
  }
  return createdApi(request, _resolve, reject, config)
}
