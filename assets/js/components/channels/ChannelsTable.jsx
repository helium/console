import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_CHANNELS, CHANNEL_SUBSCRIPTION } from '../../graphql/channels'
import { graphql } from 'react-apollo';
import { Table, Button, Empty, Pagination, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import classNames from 'classnames';
import { SkeletonLayout } from '../common/SkeletonLayout';
import _JSXStyle from "styled-jsx/style"

const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_CHANNELS, queryOptions)
class ChannelsTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10
  }

  componentDidMount() {
    const { subscribeToMore} = this.props.data

    subscribeToMore({
      document: CHANNEL_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
      }
    })
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleSubscriptionAdded = () => {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
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
                  <LabelTag
                    key={l.name}
                    text={l.name}
                    color={l.color}
                    hasIntegrations
                    hasFunction={l.function}
                    onClick={e => {
                      e.stopPropagation();
                      this.props.history.push(`/labels/${l.id}`)}
                    }
                  />
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

    const { channels, loading, error } = this.props.data

    if (loading) return <SkeletonLayout />;
    if (error) return <Text>Data failed to load, please reload the page and try again</Text>;

    return (
      <div>
        { channels.entries.length === 0 && (
          <div className="blankstateWrapper" style={{ paddingBottom: "100px" }}>
            <div className="message">
              <h1>You have no Integrations added</h1>
              <p>Choose an Integration above to get started.</p>
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
              onRow={(record, rowIndex) => ({
                onClick: () => this.props.history.push(`/integrations/${record.id}`)
              })}
              columns={columns}
              dataSource={channels.entries}
              rowKey={record => record.id}
              pagination={false}
              rowClassName="clickable-row"
              style={{ minWidth: 800 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
              <Pagination
                current={channels.pageNumber}
                pageSize={channels.pageSize}
                total={channels.totalEntries}
                onChange={page => this.handleChangePage(page)}
                style={{marginBottom: 20}}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }
}

export default ChannelsTable
