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
const _fetchLoginByTicket = async ticket => new Promise((resolve, reject) => {
  loginByTicket({ ticket }, (response) => {
    resolve(response.data)
  }, (response) => {
    reject(new Error(response.msg || '票据登录失败'))
  })
})

export const _fetchStaff = () => new Promise((resolve, reject) => {
  staff({}, (res) => {
    const { data } = res
    sessionStorage.setItem('userinfo', JSON.stringify(data))
    resolve()
  }, (res) => {
    reject(new Error(res.msg || '获取用户信息失败'))
  })
})

export const isHasCurrentMenu = (allMenu, pathname) => compare(allMenu, pathname)

export const _fetchNav = pathname => new Promise((resolve, reject) => {
  menu({}, (response) => {
    const { list } = response.data
    if (!list || list.length === 0) {
      reject(new Error('该账户没有任何菜单权限，请联系管理员'))
      return
    }
    sessionStorage.setItem('gMenuList', JSON.stringify(list))
    sessionStorage.setItem('leftNav', JSON.stringify(list))
    sessionStorage.setItem('topMenuReskey', list[0].resKey)
    resolve()
  }, (res) => {
    reject(new Error(res.msg || '获取菜单失败'))
  })
})

export const validateTickit = async function validateTickit({ query, pathname }, callback) {
  try {
    const { ticket } = query
    if (ticket) {
      const loginInfo = await _fetchLoginByTicket(ticket)
      sessionStorage.setItem('token', loginInfo.token)
    }
    await Promise.all([_fetchStaff(), _fetchNav(pathname)])
    if (typeof callback === 'function') callback()
  } catch (e) {
    sessionStorage.clear()
    message.error(e.message || '登录初始化失败')
    window.location.replace('/login')
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

export const createAjaxAction = (createdApi, startAction, endAction) => (request = {}, resolve, reject, config) => (dispatch) => {
  if (startAction) dispatch(startAction({ req: request, res: {} }))
  const _resolve = (response) => {
    if (endAction) dispatch(endAction({ req: request, res: response }))
    if (resolve) resolve(response)
  }
  return createdApi(request, _resolve, reject, config)
}
