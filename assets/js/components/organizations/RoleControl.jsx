import React from 'react'
import { Radio, Table } from 'antd';

const roles = [
  {
    value: "admin",
    name: "Administrator",
    description: "Administrators have access to all actions."
  },
  {
    value: "manager",
    name: "Manager",
    description: "Managers have similar permissions as administrators, but cannot manage Organizations, Data Credits, or Users."
  },
  {
    value: "read",
    name: "Read-Only",
    description: "Read-only users cannot perform any modifying actions."
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
