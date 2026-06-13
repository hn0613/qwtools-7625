import React, { useState, useEffect } from 'react'
import { Button, Form, Input, message } from 'antd'
import { regExpConfig } from '@reg'
import Drawer from '@components/draw/draw'
import {
  fetchModuleUpdateDetail,
  fetchModuleAdd,
} from '@apis/manage'

const FormItem = Form.Item

export default function ModuleAdd({ visible, onCancel, title, formType, parentId, itemId, initialValues, handleOk }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 每次弹窗打开时，先重置再回填，保证表单状态干净
  useEffect(() => {
    if (visible) {
      form.resetFields()
      form.setFieldsValue({
        parentId: initialValues.parentId ?? parentId ?? '',
        resName: initialValues.resName || '',
        sort: initialValues.sort || '0',
        resModule: initialValues.resModule || '',
        resKey: initialValues.resKey || '',
        resIcon: initialValues.resIcon || '',
      })
    }
  }, [visible])

  const handleSubmit = (formValues) => {
    const values = { ...formValues, resType: 1 }
    setLoading(true)
    if (formType === 'modify') {
      fetchModuleUpdateDetail({ ...values, id: itemId }, (result) => {
        message.success(result.msg)
        setLoading(false)
        handleOk()
      })
    } else {
      fetchModuleAdd(values, (result) => {
        message.success(result.msg)
        setLoading(false)
        handleOk()
      })
    }
  }

  const footer = () => {
    return (
      <div>
        <Button type="primary" onClick={() => form.submit()} loading={loading}>确定</Button>
        <Button onClick={onCancel}>取消</Button>
      </div>
    )
  }

  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 17 },
  }

  return (
    <Drawer
      visible={visible}
      title={title}
      onCancel={onCancel}
      footer={footer()}
      className="modal-header modal-body"
    >
      <div className="modalcontent">
        <Form
          form={form}
          layout="horizontal"
          autoComplete="off"
          onFinish={handleSubmit}
        >
          <FormItem {...formItemLayout} label="上级菜单id" hasFeedback>
            <Form.Item name="parentId" noStyle>
              <Input disabled />
            </Form.Item>
          </FormItem>
          <FormItem {...formItemLayout} label="新增菜单名称" hasFeedback>
            <Form.Item
              name="resName"
              rules={[
                { required: true, message: '请输入菜单名称' },
              ]}
              noStyle
            >
              <Input placeholder="请输入菜单名称" />
            </Form.Item>
          </FormItem>
          <FormItem {...formItemLayout} label="排序数字" hasFeedback>
            <Form.Item
              name="sort"
              rules={[
                { required: true, message: '请输入排序数字' },
                { pattern: regExpConfig.num, message: '请输入数字' },
              ]}
              noStyle
            >
              <Input placeholder="请输入菜单的排序数字" />
            </Form.Item>
          </FormItem>
          <FormItem {...formItemLayout} label="模块名称" hasFeedback>
            <Form.Item
              name="resModule"
              rules={[
                { required: true, message: '请输入模块名称' },
              ]}
              noStyle
            >
              <Input placeholder="请输入模块名称" />
            </Form.Item>
          </FormItem>
          <FormItem {...formItemLayout} label="关键字" hasFeedback>
            <Form.Item
              name="resKey"
              rules={[
                { required: true, message: '请输入关键字' },
              ]}
              noStyle
            >
              <Input placeholder="请输入关键字" />
            </Form.Item>
          </FormItem>
          <FormItem {...formItemLayout} label="图标名称" hasFeedback>
            <Form.Item
              name="resIcon"
              rules={[
                { required: true, message: '请输入图标名称' },
                { pattern: regExpConfig.isNumAlpha, message: '图标名称格式不正确' },
              ]}
              noStyle
            >
              <Input placeholder="请输入图标名称" />
            </Form.Item>
          </FormItem>
        </Form>
      </div>
    </Drawer>
  )
}
