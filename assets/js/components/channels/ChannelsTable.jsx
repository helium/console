import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_CHANNELS } from '../../graphql/channels'
import withGql from '../../graphql/withGql'
import { Table, Button, Empty, Pagination, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import classNames from 'classnames';
import { SkeletonLayout } from '../common/SkeletonLayout';
import _JSXStyle from "styled-jsx/style"

const { Text } = Typography

class ChannelsTable extends Component {
  state = {
    page: 1,
    pageSize: 10
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:channels_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:channels_index_table:${currentOrganizationId}:channel_list_update`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    })

    if (!this.props.paginatedChannelsQuery.loading) {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { refetch } = this.props.paginatedChannelsQuery
    refetch({ page, pageSize })
  }

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
        title: 'Labels',
        dataIndex: 'labels',
        render: (labels, record) => {
          return <React.Fragment>
            {
              labels.map(l => (
                <Link to={`/labels/${l.id}`} key={l.id}>
                  <LabelTag
                    text={l.name}
                    color={l.color}
                    hasIntegrations
                    hasFunction={l.function}
                  />
                </Link>
              ))
            }
          </React.Fragment>
        }
      },
      {
        title: 'Devices',
        dataIndex: 'device_count',
        render: text => text ? text : 0
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
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
        )
      },
    ]

    const { channels, loading, error } = this.props.paginatedChannelsQuery

    if (loading) return <SkeletonLayout />;
    if (error) return <Text>Data failed to load, please reload the page and try again</Text>;

    return (
      <div>
        { channels.entries.length === 0 && (
          <div className="blankstateWrapper" style={{ paddingBottom: "100px" }}>
            <div className="message">
              <h1>You have no Integrations added</h1>
              <p>Choose an Integration below to get started.</p>
              <p>More details about adding Integrations can be found <a href="https://docs.helium.com/use-the-network/console/integrations/" target="_blank"> here.</a></p>
            </div>
            <style jsx>{`

                .message {

                  width: 100%;
                  max-width: 500px;
                  margin: 0 auto;
                  text-align: center;

                }

                h1, p  {

                  color: #242425;
                }
                h1 {
                  font-size: 30px;
                  margin-bottom: 10px;
                }
                p {
                  font-size: 16px;
                  font-weight: 300;
                  opacity: 0.75;
                }
              `}
            </style>
          </div>
        )}
        { channels.entries.length > 0 && (
          <React.Fragment>
            <Table
              columns={columns}
              dataSource={channels.entries}
              rowKey={record => record.id}
              pagination={false}
              style={{ minWidth: 800 }}
              onRow={(record, rowIndex) => ({
                onClick: e => {
                  if (e.target.tagName === 'TD') {
                    this.props.history.push(`/integrations/${record.id}`)
                  }
                }
              })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
              <Pagination
                current={channels.pageNumber}
                pageSize={channels.pageSize}
                total={channels.totalEntries}
                onChange={page => this.handleChangePage(page)}
                style={{marginBottom: 20}}
                showSizeChanger={false}
              />
            </div>
          </React.Fragment>
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

export default connect(mapStateToProps, null)(
  withGql(ChannelsTable, PAGINATED_CHANNELS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'paginatedChannelsQuery' }))
)
