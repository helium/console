import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { deleteLabel } from '../../actions/label'
import { redForTablesDeleteText } from '../../util/colors'
import { PAGINATED_LABELS } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination, Select, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import LabelsImg from '../../../img/labels.svg'
import classNames from 'classnames';
import { IndexSkeleton } from '../common/IndexSkeleton';
import { StatusIcon } from '../common/StatusIcon'
import _JSXStyle from "styled-jsx/style"

const { Text } = Typography
const { Option } = Select
const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"

class LabelIndexTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:labels_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:labels_index_table:${currentOrganizationId}:label_list_update`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize, this.state.column, this.state.order)
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleSelectOption = (value) => {
    if (value === 'removeDevices') this.props.openRemoveAllDevicesFromLabelsModal(this.state.selectedRows)
    else if (value === 'addIntegration') this.props.openLabelAddChannelModal(this.state.selectedRows)
    else if (value === 'swapLabelDevices') this.props.openSwapLabelModal(this.state.selectedRows)
    else this.props.openDeleteLabelModal(this.state.selectedRows)
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize, column, order } = this.state
    this.refetchPaginatedEntries(page, pageSize, column, order)
  }

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { refetch } = this.props.paginatedLabelsQuery
    refetch({ page, pageSize, column, order })
  }

  handleDeleteLabelClick = (label) => {
    if (label.channels.length === 0) this.props.deleteLabel(label.id)
    else this.props.openDeleteLabelModal([label])
  }

  handleSort = (pagi, filter, sorter) => {
    const { page, pageSize, order, column } = this.state

    if (column == sorter.field && order == 'asc') {
      this.setState({ order: 'desc' })
      this.refetchPaginatedEntries(page, pageSize, column, 'desc')
    }
    if (column == sorter.field && order == 'desc') {
      this.setState({ order: 'asc' })
      this.refetchPaginatedEntries(page, pageSize, column, 'asc')
    }
    if (column != sorter.field) {
      this.setState({ column: sorter.field, order: 'asc' })
      this.refetchPaginatedEntries(page, pageSize, sorter.field, 'asc')
    }
  }

  render() {
    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
        sorter: true,
        render: (text, record) => (
          <React.Fragment>
            <Link to={`/labels/${record.id}`}>{text} <LabelTag text={text} color={record.color} style={{ marginLeft: 10 }} hasIntegrations={record.channels.length > 0} hasFunction={record.function}/></Link>
            {
              record.devices.find(d => moment().utc().local().subtract(1, 'days').isBefore(moment.utc(d.last_connected).local())) &&
                <StatusIcon tooltipTitle='One or more attached devices last connected within the last 24h' style={{ marginLeft: "2px" }} {...this.props} />
            }
          </React.Fragment>
        )
      },
      {
        title: 'Associated Integrations',
        dataIndex: 'channels',
        render: (text, record) => (
          <div>
            {
              record.channels.map(c => (
                <Link
                  key={c.id}
                  style={{ marginRight: 8 }}
                  to={`/integrations/${c.id}`}
                >
                  {c.name}
                </Link>
              ))
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
        sorter: true,
        dataIndex: 'creator',
      },
      {
        title: 'Date Activated',
        sorter: true,
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
                icon={<DeleteOutlined />}
                size="small"
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

    const { loading, error, labels } = this.props.paginatedLabelsQuery

    if (loading) return <IndexSkeleton title="Labels" />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onChange: (keys, selectedRows) => this.setState({ selectedRows })
    }

    return (
      <div>
        {
          labels.entries.length === 0 && (
            <div className="blankstateWrapper">
            <div className="message">
      <img src={LabelsImg} />
      <h1>No Labels</h1>
      <p>You haven’t added any labels yet.</p>

      <div className="explainer">
        <h2>What are Labels?</h2>
        <p>Labels allow you to organise your devices into groups. Devices can have many Labels that describe different aspects of it.</p>
        <p>Labels are also used to apply <a href="/integrations">Integrations</a> and <a href="/functions">Functions</a> to devices. </p>
        <p>More details can be found <a href="https://docs.helium.com/use-the-network/console/labels" target="_blank">here</a>.</p>
      </div>

            </div>
            <style jsx>{`

                .message {

                  width: 100%;
                  max-width: 500px;
                  margin: 0 auto;
                  text-align: center;

                }

                .explainer {
                  padding: 20px 60px;
                  border-radius: 20px;
                  text-align: center;
                  margin-top: 50px;
                  box-sizing: border-box;
                    border: none;
  background: #F6F8FA;
                }

                .explainer h2 {
                  color: #242424;
                  font-size: 20px;
                }
                .explainer p {
                  color: #565656;
                  font-size: 15px;
                }

                .explainer p a {
                  color: #096DD9;
                }

                h1, p  {

                  color: #242425;
                }
                h1 {
                  font-size: 46px;
                  margin-bottom: 10px;
                  font-weight: 600;
                  margin-top: 10px;
                }
                p {
                  font-size: 20px;
                  font-weight: 300;
                }
              `}</style>

            </div>
          )
        }
        {labels.entries.length > 0 && (
          <div>
            <p className="page-description">
              Labels are a powerful mechanism to organize devices, assign integrations, and provide scalability and flexibility to managing your projects. <a href="https://docs.helium.com/use-the-network/console/labels" target="_blank"> Tell me more about Labels.</a>
            </p>
          <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${labels.totalEntries} ${labels.totalEntries == 1 ? "Label" : "Labels"}`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 330, marginRight: 10 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="swapLabelDevices" disabled={this.state.selectedRows.length !== 1}>Swap Selected Label</Option>
              <Option value="addIntegration" disabled={this.state.selectedRows.length == 0}>Add Integration to Selected Labels</Option>
              <Option value="removeDevices" disabled={this.state.selectedRows.length == 0}>Remove All Devices from Selected Labels</Option>
              <Option value="remove" disabled={this.state.selectedRows.length == 0} style={{ color: redForTablesDeleteText }}>Delete Selected Labels</Option>
            </Select>
          </UserCan>
        }
      >
          <React.Fragment>
            <Table
              columns={columns}
              dataSource={labels.entries}
              rowKey={record => record.id}
              pagination={false}
              rowSelection={rowSelection}
              onChange={this.handleSort}
              style={{ minWidth: 800 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
              <Pagination
                current={labels.pageNumber}
                pageSize={labels.pageSize}
                total={labels.totalEntries}
                onChange={page => this.handleChangePage(page)}
                style={{marginBottom: 20}}
                showSizeChanger={false}
              />
            </div>
          </React.Fragment>
          </Card>
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteLabel }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(LabelIndexTable, PAGINATED_LABELS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'paginatedLabelsQuery' }))
)
