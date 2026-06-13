
import axios from 'axios'
import { mockURL, /* baseURL, */ path } from '../configs/config'
import { parseQueryString } from '../configs/common'

const { CancelToken } = axios

const prefix = 'usercenter'
const option = { baseURL: mockURL }

function handleLoginExpired(text) {
  sessionStorage.clear()
  message.warning(text || '用户登录过期或从其他浏览器登录')
  const currentPath = window.location.pathname + window.location.search
  const loginUrl = currentPath && currentPath !== '/'
    ? `/login?redirect=${encodeURIComponent(currentPath)}`
    : '/login'
  window.location.replace(loginUrl)
}

function createApi(api, options) {
  const obj = parseQueryString(window.location.href)
  let url = api
  if (obj.key) {
    url = `${api}?key=${obj.key}`
    if (obj.sourceName) {
      url = `${api}?key=${obj.key}&sourceName=${obj.sourceName}`
    }
  }
  return ((api, opts) => {
    let baseConfig = {
      url: '/',
      method: 'post',
      baseURL: '',
      headers: {
        'Content-Type': 'text/plain',
      },
      params: {},
      data: {},
      timeout: '',
      withCredentials: true,
      responseType: 'json',
      validateStatus(status) {
        return status >= 200 && status < 300
      },
    }
    baseConfig = { ...baseConfig, timeout: 30000, baseURL: mockURL }

    return (...rest) => {
      const data = rest[0] || {}
      const token = sessionStorage.getItem('token')
      if (token) {
        // data.token = token
      }
      let success = null
      let failure = null
      let config = null
      for (let i = 1; i < rest.length; i += 1) {
        if (typeof rest[i] === 'function') {
          if (!success) {
            success = rest[i]
          } else {
            failure = rest[i]
          }
        }
        if (Object.prototype.toString.call(rest[i]) === '[object Object]') {
          config = rest[i]
        }
      }

      const hooks = {
        abort: null,
      }

      const cancelToken = new CancelToken((c) => { hooks.abort = c })
      
      if (opts && (opts.baseURL.indexOf('12602') !== -1)) {
        baseConfig.withCredentials = false
      } else {
        baseConfig.withCredentials = true
      }
      
      axios({
        ...baseConfig, ...opts, ...config, url: url, data, cancelToken,
      })
        .then(response => response.data)
        .then((response) => {
          switch (response.status) {
            case 1: { success && success(response); break }
            case 0: {
              if (typeof failure === 'function') {
                failure(response)
              } else {
                if (response.msg === '系统内部错误!') {
                  message.error(response.msg)
                } else {
                  message.warning(response.msg)
                }
              }
              break
            }
            case -1: {
              if (typeof failure === 'function') {
                failure(response)
              }
              handleLoginExpired(response.msg)
              break
            }
            default: {
              if (typeof failure === 'function') {
                failure(response)
              } else {
                handleLoginExpired()
              }
            }
          }
        })
        .catch((e) => {
          if (axios.isCancel(e)) {
            // 请求被取消
          } else {
            if (typeof failure === 'function') {
              if (e.code === 'ECONNABORTED') {
                failure({
                  data: '',
                  msg: '服务器连接超时',
                  status: 0,
                })
              } else {
                failure({
                  data: '',
                  msg: e.message,
                  status: 0,
                })
              }
            }
          }
        })
      return hooks
    }
  })(api, options)
}

export const login = createApi(`${path}/${prefix}/login`, option) // 登陆
export const logout = createApi(`${path}/${prefix}/logout`, option) // 登出
export const loginByTicket = createApi(`${path}/${prefix}/loginByTicket`, option) // 通过ticket登陆
export const loginByKey = createApi(`${path}/service/pagerservice/checkKey`, option) // 通过key进入项目
export const staff = createApi(`${path}/${prefix}/user/userInfo`, option) // 用户信息
export const synUser = createApi(`${path}/${prefix}/user/synUser`, option)// 同步用户
export const menu = createApi(`${path}/${prefix}/user/userMenu`, option) // 获取菜单
export const getLevel = createApi(`${path}/${prefix}/user/getLevel`, option) // 当前用户的等级
export const getBtns = createApi(`${path}/${prefix}/resource/listByPid`, option) // 获取菜单id
export const getAllRetrieval = createApi(`${path}/data/sys/retrieval/queryAllRetrievald`) // 获取gForm2.0头部搜索
export const updatePwd = createApi(`${path}/${prefix}/user/updatePwd`, option) // 修改密码
