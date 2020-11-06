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
import LabelsImg from '../../../img/labels.svg'
import classNames from 'classnames';
import { IndexSkeleton } from '../common/IndexSkeleton';

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
    else if (value === 'swapLabelDevices') this.props.openSwapLabelModal(this.state.selectedRows)
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
            <Link to={`/labels/${record.id}`}>{text}</Link><LabelTag text={text} color={record.color} style={{ marginLeft: 10 }} hasIntegrations={record.channels.length > 0} hasFunction={record.function}/>
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

    const { loading, error, labels } = this.props.data

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
      <p>You haven’t created any labels yet.</p>

      <div className="explainer">
        <h2>What are Labels?</h2>
        <p>Labels allow you to organise your devices into groups. Devices can have many Labels that describe different aspects of it.</p>
        <p>Labels are also used to apply <a href="/integrations">Integrations</a> and <a href="/functions">Functions</a> to devices. </p>
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


                .blankstateWrapper {
                  width: 100%;
                  padding-top: 100px;
                  margin: 0 auto;
                  position: relative;


                }
              `}</style>

            </div>
          )
        }
        {labels.entries.length > 0 && (
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
          </React.Fragment>
          </Card>
        )}
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteLabel }, dispatch)
}

export default LabelIndexTable
