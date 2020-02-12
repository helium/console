import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';
import find from 'lodash/find'
import moment from 'moment'
import get from 'lodash/get'
import { deleteLabel } from '../../actions/label'
import LabelTag from '../common/LabelTag'
import { PAGINATED_LABELS } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination } from 'antd';
const { Text } = Typography

const defaultVariables = {
  page: 1,
  pageSize: 10
}

@connect(null, mapDispatchToProps)
class LabelIndexTable extends Component {
  render() {
    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
        render: (text, record) => (
          <React.Fragment>
            <Text>{text}</Text><LabelTag text={text} color={record.color} style={{ marginLeft: 10 }} />
          </React.Fragment>
        )
      },
      {
        title: 'No. of Devices',
        dataIndex: 'devices',
        render: (text, record) => <Text>{record.devices.length}</Text>
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
            <Link to="#" onClick={() => this.props.deleteLabel(record.id)}>Delete</Link>
            <Text>{" | "}</Text>
            <Link to={`/labels/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    return (
      <Query query={PAGINATED_LABELS} fetchPolicy={'cache-and-network'} variables={defaultVariables}>
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

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${results.entries.length} Labels`}
        extra={
          <Button
            type="primary"
            size="large"
            icon="tag"
            onClick={this.props.openCreateLabelModal}
          >
            Create New Label
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={results.entries}
          rowKey={record => record.id}
          pagination={false}
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
  return bindActionCreators({ deleteLabel }, dispatch)
}

export default LabelIndexTable
