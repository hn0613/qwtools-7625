import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import { regExpConfig } from '@reg';
import Drawer from '@components/draw/draw';

const FormItem = Form.Item;

export default function AddButtonModal({ visible, onCancel, title, buttonEditData, state, handleAdd }) {
  const [form] = Form.useForm()

  // 每次弹窗打开时，先重置再回填，保证表单状态干净
  useEffect(() => {
    if (visible) {
      form.resetFields()
      form.setFieldsValue({
        resName: buttonEditData.resName || '',
        sort: `${buttonEditData.sort || '0'}`,
        resKey: `${buttonEditData.resKey || ''}`,
      })
    }
  }, [visible])

  const handleSubmit = (values) => {
    const submitValues = { ...values, resType: 3 }
    if (state === 'edit') {
      submitValues.id = buttonEditData.id
    }
    handleAdd(submitValues)
  }

  const footer = () => {
    return (
      <div>
        <Button type="primary" onClick={() => form.submit()}>
          确定
        </Button>
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
          <FormItem {...formItemLayout} label="新增按钮名称" hasFeedback>
            <Form.Item
              name="resName"
              rules={[{ required: true, message: '请输入按钮名称' }]}
              noStyle
            >
              <Input placeholder="请输入按钮名称" />
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
          <FormItem {...formItemLayout} label="关键字" hasFeedback>
            <Form.Item
              name="resKey"
              rules={[{ required: true, message: '请输入关键字' }]}
              noStyle
            >
              <Input placeholder="请输入关键字" />
            </Form.Item>
          </FormItem>
        </Form>
      </div>
    </Drawer>
  )
}
