import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';
import find from 'lodash/find'
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import { deleteDevice } from '../../actions/device'
import { removeDeviceFromLabel } from '../../actions/label'
import { PAGINATED_DEVICES_BY_LABEL } from '../../graphql/devices'
import { Card, Button, Typography, Table, Pagination } from 'antd';
const { Text } = Typography

const defaultVariables = {
  page: 1,
  pageSize: 10
}

@connect(null, mapDispatchToProps)
class LabelShowTable extends Component {
  render() {
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (text, record) => (
          <span>
            {
              record.labels.map(l => (
                <LabelTag key={l.name} text={l.name} color={l.color} />
              ))
            }
          </span>
        )
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <div>
            <Link to="#" onClick={() => this.props.deleteDevice(record.id, false)}>Delete</Link>
            <Text>{" | "}</Text>
            <Link to="#" onClick={() => this.props.removeDeviceFromLabel(record.id, this.props.labelId)}>Remove</Link>
            <Text>{" | "}</Text>
            <Link to={`/devices/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    const variables = Object.assign({}, defaultVariables, { labelId: this.props.labelId })

    return (
      <Query query={PAGINATED_DEVICES_BY_LABEL} fetchPolicy={'cache-and-network'} variables={variables}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            columns={columns}
            data={data}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            variables={variables}
            {...this.props}
          />
        )}
      </Query>
    )
  }
}

class QueryResults extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: get(props, ['variables', 'pageSize']) || 10
    }
  }

  render() {
    const { loading, error, data, columns } = this.props

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const results = find(data, d => d.entries !== undefined)

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {

      },
      onSelect: (record, selected, selectedRows) => {

      },
      onSelectAll: (selected, selectedRows, changeRows) => {

      },
    }

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${results.entries.length} Devices`}
      >
        <Table
          columns={columns}
          dataSource={results.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={results.pageNumber}
            pageSize={results.pageSize}
            total={results.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevice, removeDeviceFromLabel }, dispatch)
}

export default LabelShowTable
