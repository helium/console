import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { Table, Button, Empty, Tag, Typography, Select } from 'antd';
import EmptyImg from '../../../img/emptydevice.svg'
import { Card } from 'antd';
const { Text } = Typography
const { Option } = Select

class DeviceShowTable extends Component {
  state = {
    selectedRows: []
  }

  handleSelectOption = () => {
    this.props.openDeviceRemoveLabelModal(this.state.selectedRows)
  }

  render() {
    const { device, labels, openDeviceRemoveLabelModal, openDevicesAddLabelModal } = this.props

    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
        render: (text, record) => (
          <React.Fragment>
            <Text>{text}</Text>
            <LabelTag text={text} color={record.color} style={{ marginLeft: 10 }}/>
          </React.Fragment>
        )
      },
      {
        title: 'Associated Integrations',
        dataIndex: 'channels',
        render: (text, record) => (
          <div>
            {
              record.channels.map((c, i) => <Text key={c.id}>{c.name}{i != record.channels.length - 1 && ", "}</Text>)
            }
          </div>
        )
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div>
            <UserCan>
            <Link to="#" onClick={() => openDeviceRemoveLabelModal([record])}>Remove</Link>
            <Text>{" | "}</Text>
            </UserCan>
            <Link to={`/labels/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    const rowSelection = {
      onSelect: (record, selected) => {
        const { selectedRows } = this.state
        if (selected) this.setState({ selectedRows: selectedRows.concat(record) })
        else this.setState({ selectedRows: selectedRows.filter(r => r.id !== record.id) })
      },
      onSelectAll: (selected, selectedRows) => {
        if (selected) this.setState({ selectedRows })
        else this.setState({ selectedRows: [] })
      },
    }

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${labels.length} Labels Attached`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 220, marginRight: 10 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="remove" style={{ color: '#F5222D' }}>Remove Labels from Device</Option>
            </Select>
            <Button
              type="primary"
              icon="plus"
              onClick={this.props.openDevicesAddLabelModal}
            >
              Add Label
            </Button>
          </UserCan>
        }
      >
        <Table
          columns={columns}
          dataSource={labels}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
      </Card>
    )
  }
}

export default DeviceShowTable
