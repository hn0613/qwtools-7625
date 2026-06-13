import { set } from '@config'

// 默认首页路径（菜单 resKey 对应值）
export const HOME_PATH = 'desk$/index'

// 路由路径 → 页签标题映射
// key 必须与 LeftNav 菜单项的 resKey 一致，也是路由配置中的 path
export const routeMeta = {
  [HOME_PATH]: '首页',
  'echarts': '图表',
  'editor': '编辑器',
  [`${set}/userManage`]: '用户管理',
  [`${set}/roleManage`]: '角色管理',
  [`${set}/moduleManage`]: '菜单管理',
}

// 根据路径获取页签标题，未知路径返回 null
export function getRouteTitle(path) {
  if (!path) return null
  // 去掉开头的 /
  const key = path.replace(/^\//, '')
  return routeMeta[key] || null
}

// 不参与页签体系的路径前缀
export const EXCLUDED_PATHS = ['login']

// 判断一个路径是否应排除在页签体系之外
export function isExcludedPath(pathname) {
  const path = pathname.replace(/^\//, '')
  return EXCLUDED_PATHS.some(p => path === p || path.startsWith(`${p}/`))
}
