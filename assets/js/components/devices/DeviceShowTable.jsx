import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import LabelTag from '../common/LabelTag'
import { removeDevicesFromLabel } from '../../actions/label'
import { Table, Button, Empty, Tag, Typography, Select } from 'antd';
import EmptyImg from '../../../img/emptydevice.svg'
import { Card } from 'antd';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class DeviceShowTable extends Component {
  render() {
    const { device, labels, removeDevicesFromLabel } = this.props

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
            <Link to="#" onClick={() => removeDevicesFromLabel([device], record.id)}>Remove</Link>
            <Text>{" | "}</Text>
            <Link to={`/labels/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${labels.length} Labels Attached`}
        extra={
          <Button
            type="primary"
            icon="plus"
            onClick={() => {}}
          >
            Add Label
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={labels}
          rowKey={record => record.id}
          pagination={false}
        />
      </Card>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ removeDevicesFromLabel }, dispatch)
}

export default DeviceShowTable
