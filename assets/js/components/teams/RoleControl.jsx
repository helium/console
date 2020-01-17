import React, { Component } from 'react'
import { Radio, Table, Text } from 'antd';

const roles = [
  {
    value: "admin",
    name: "Administrator",
    description: "Administrators have access to all actions."
  },
  {
    value: "manager",
    name: "Manager",
    description: "Managers can modify teams and channels only."
  },
]

const RoleControl = (props) => {
  const { value, onChange } = props
  const columns = [
    {
      title: 'Role',
      dataIndex: 'name',
      render: (text, record) => (
        <Radio
          key={record.value}
          onChange={onChange}
          checked={value === record.value}
          name="role"
          value={record.value}
        >
          {record.name}
        </Radio>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
  ]
  return (
    <Table
      columns={columns}
      dataSource={roles}
      pagination={false}
      rowKey="name"
      bordered={false}
      showHeader={false}
      id="RoleTable"
    />
  )
}

export default RoleControl
