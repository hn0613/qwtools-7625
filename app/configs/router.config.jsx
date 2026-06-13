import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from 'react-router-dom'
import { set } from '@config'
import { setNavigate } from '@configs/ajax'

import App from '@pages/base/app'
import Example from '@pages/base/example'
import Login from '@pages/base/login'
import NotFound from '@pages/base/notfound'
import Echarts from '@pages/menu/echarts'
import Editor from '@pages/menu/editor'
import UserManage from '@pages/set/userManage'
import RoleManage from '@pages/set/roleManage'
import ModuleManage from '@pages/set/moduleManage'

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate()
  React.useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  const token = sessionStorage.getItem('token')
  const query = new URLSearchParams(window.location.search)
  const hasTicket = query.get('ticket')
  const hasKey = query.get('key')

  if (!token && !hasTicket && !hasKey) {
    return <Navigate to="/login" replace />
  }
  return children
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Example />,
      },
      {
        path: 'desk$/index',
        element: <Example />,
      },
      {
        path: 'echarts',
        element: <Echarts />,
      },
      {
        path: 'editor',
        element: <Editor />,
      },
      {
        path: `${set}/userManage`,
        element: <UserManage />,
      },
      {
        path: `${set}/roleManage`,
        element: <RoleManage />,
      },
      {
        path: `${set}/moduleManage`,
        element: <ModuleManage />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
], {
  future: {
    v7_startTransition: true,
  },
})

export default function Routes() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
