import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { deleteLabel } from '../../actions/label'
import { redForTablesDeleteText } from '../../util/colors'
import { PAGINATED_LABELS, LABEL_SUBSCRIPTION } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(PAGINATED_LABELS, queryOptions)
class LabelIndexTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
    selectedRows: [],
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: LABEL_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
        this.setState({ selectedRows: [] })
      }
    })
  }

  handleSelectOption = (value) => {
    if (value === 'removeDevices') this.props.openRemoveAllDevicesFromLabelsModal(this.state.selectedRows)
    else if (value === 'addIntegration') this.props.openLabelAddChannelModal(this.state.selectedRows)
    else this.props.openDeleteLabelModal(this.state.selectedRows)
  }

  handleSubscriptionAdded = () => {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  handleDeleteLabelClick = (label) => {
    if (label.channels.length === 0) this.props.deleteLabel(label.id)
    else this.props.openDeleteLabelModal([label])
  }

  render() {
    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
        render: (text, record) => (
          <React.Fragment>
            <Link to="">{text}</Link><LabelTag text={text} color={record.color} style={{ marginLeft: 10 }} hasIntegrations={record.channels.length > 0}/>
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
        title: 'No. of Devices',
        dataIndex: 'devices',
        render: (text, record) => <Text>{record.devices.length}</Text>
      },
      {
        title: 'Creator',
        dataIndex: 'creator',
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
              <Button
                type="danger"
                icon="delete"
                shape="circle"
                onClick={e => {
                  e.stopPropagation()
                  this.handleDeleteLabelClick(record)
                }}
              />
            </UserCan>
          </div>
        )
      },
    ]

    const { loading, error, labels } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onChange: (keys, selectedRows) => this.setState({ selectedRows })
    }

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${labels.entries.length} Labels`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 270, marginRight: 10 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="addIntegration" disabled={this.state.selectedRows.length == 0}>Add Integration to Selected Labels</Option>
              <Option value="removeDevices" disabled={this.state.selectedRows.length == 0}>Remove All Devices from Selected Labels</Option>
              <Option value="remove" disabled={this.state.selectedRows.length == 0} style={{ color: redForTablesDeleteText }}>Delete Selected Labels</Option>
            </Select>
          </UserCan>
        }
      >
        <Table
          onRow={(record, rowIndex) => ({
            onClick: () => this.props.history.push(`/labels/${record.id}`)
          })}
          columns={columns}
          dataSource={labels.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={labels.pageNumber}
            pageSize={labels.pageSize}
            total={labels.totalEntries}
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
