import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import UserCan from '../common/UserCan'
import { minWidth } from '../../util/constants'
import { Table, Button, Pagination, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
const { Text } = Typography

class ChannelIndexTable extends Component {
  render() {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        render: (text, record) => (
          <Link to={`/integrations/${record.id}`}>{text}</Link>
        )
      },
      {
        title: 'Type',
        dataIndex: 'type_name'
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <UserCan>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                size="small"
                onClick={e => {
                  e.stopPropagation()
                  this.props.openDeleteChannelModal(record)
                }}
              />
            </UserCan>
          </div>
        )
      },
    ]

    const { channels } = this.props

    return (
      <div className="no-scroll-bar" style={{ overflowX: 'scroll' }}>
        <div style={{ minWidth, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px' }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>All Integrations</Text>
        </div>
        <Table
          columns={columns}
          dataSource={channels.entries}
          rowKey={record => record.id}
          pagination={false}
          style={{ minWidth, overflowX: 'scroll', overflowY: 'hidden' }}
          onRow={(record, rowIndex) => ({
            onClick: e => {
              if (e.target.tagName === 'TD') {
                this.props.history.push(`/integrations/${record.id}`)
              }
            }
          })}
        />
        <div style={{ minWidth, display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={channels.pageNumber}
            pageSize={channels.pageSize}
            total={channels.totalEntries}
            onChange={page => this.props.handleChangePage(page)}
            style={{marginBottom: 20}}
            showSizeChanger={false}
          />
        </div>
      </div>
    )
  }
}

export default ChannelIndexTable
