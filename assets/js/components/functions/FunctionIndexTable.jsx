import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom'
import UserCan from '../common/UserCan'
import { updateFunction } from '../../actions/function'
import analyticsLogger from '../../util/analyticsLogger'
import { Table, Button, Pagination, Switch, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
const { Text} = Typography

const functionFormats = {
  cayenne: "Cayenne LPP",
  browan_object_locator: "Browan Object Locator",
  custom: "Custom"
}

class FunctionIndexTable extends Component {
  render() {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        render: (text, record) => <Link to={`/functions/${record.id}`}>{text}</Link>
      },
      {
        title: 'Type',
        dataIndex: 'format',
        render: text => <span>{functionFormats[text]}</span>
      },
      {
        title: '',
        dataIndex: 'active',
        render: (text, record) => (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <UserCan>
              <Switch
                checked={record.active}
                onChange={(value, e) => {
                  e.stopPropagation()
                  this.props.updateFunction(record.id, { active: !record.active })
                  analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_ACTIVE", { "id": record.id, "active": !record.active })
                }}
              />
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                size="small"
                style={{ marginLeft: 10 }}
                onClick={e => {
                  e.stopPropagation()
                  this.props.openDeleteFunctionModal(record)
                }}
              />
            </UserCan>
          </div>
        )
      }
    ]

    const { functions } = this.props

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px' }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>All Functions</Text>
        </div>
        <Table
          onRow={(record, rowIndex) => ({
            onClick: () => this.props.history.push(`/functions/${record.id}`)
          })}
          columns={columns}
          dataSource={functions.entries}
          rowKey={record => record.id}
          pagination={false}
          rowClassName="clickable-row"
          style={{ minWidth: 800, overflowX: 'scroll', overflowY: 'hidden' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={functions.pageNumber}
            pageSize={functions.pageSize}
            total={functions.totalEntries}
            onChange={page => this.props.handleChangePage(page)}
            style={{marginBottom: 20}}
            showSizeChanger={false}
          />
        </div>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateFunction }, dispatch);
}

export default connect(null, mapDispatchToProps)(FunctionIndexTable)
