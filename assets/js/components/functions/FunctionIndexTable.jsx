import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { updateFunction } from '../../actions/function'
import { PAGINATED_FUNCTIONS, FUNCTION_SUBSCRIPTION } from '../../graphql/functions'
import analyticsLogger from '../../util/analyticsLogger'
import withGql from '../../graphql/withGql'
import FunctionsImg from '../../../img/functions.svg'
import { Table, Button, Pagination, Typography, Card, Switch } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { IndexSkeleton } from '../common/IndexSkeleton';
import _JSXStyle from "styled-jsx/style"

const { Text } = Typography

const functionFormats = {
  cayenne: "Cayenne LPP",
  browan_object_locator: "Browan Object Locator",
  custom: "Custom"
}

class FunctionIndexTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:function_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:function_index_table:${currentOrganizationId}:function_list_update`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    })
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
    const { fetchMore } = this.props.paginatedFunctionsQuery
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
        render: (text, record) => <Link to={`/functions/${record.id}`}>{text}</Link>
      },
      {
        title: 'Type',
        dataIndex: 'format',
        render: text => <span>{functionFormats[text]}</span>
      },
      {
        title: 'Applied To',
        dataIndex: 'labels',
        render: (labels, record) => {
          return <React.Fragment>
            {
              labels.map(l => (
                <UserCan
                  key={l.id}
                  alternate={
                    <LabelTag
                      key={l.name}
                      text={l.name}
                      color={l.color}
                      hasIntegrations={l.channels && l.channels.length > 0}
                      hasFunction
                    />
                  }
                >
                  <LabelTag
                    key={l.name}
                    text={l.name}
                    color={l.color}
                    closable
                    hasIntegrations={l.channels && l.channels.length > 0}
                    hasFunction
                    onClose={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      this.props.openRemoveFunctionLabelModal(record, l)
                    }}
                  />
                </UserCan>
              ))
            }
          </React.Fragment>
        }
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

    const { functions, loading, error } = this.props.paginatedFunctionsQuery

    if (loading) return <IndexSkeleton title="Functions" />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div>
        {
          functions.entries.length === 0 && (
            <div className="blankstateWrapper">
              <div className="message">
              <img src={FunctionsImg} />
              <h1>No Functions</h1>
              <p>You haven’t added any functions yet.</p>

              <div className="explainer">
                <h2>What are Functions?</h2>
                <p>Functions are operators that can be applied to <a href="/labels">Labels</a> and act on the data of any <a href="/devices">devices</a> in those Labels.</p>
                <p>More details can be found <a href="https://docs.helium.com/use-the-network/console/functions/" target="_blank">here</a>.</p>
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

              h1, p {
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
        {
          functions.entries.length > 0 && (
            <div>
              <p className="page-description">
                Functions are operators that can be applied to Labels and act on the data of any devices in those Labels. <a href="https://docs.helium.com/use-the-network/console/functions/" target="_blank"> Tell me more about functions.</a>
              </p>
            <Card
              bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
              title={`${functions.totalEntries} Functions`}
            >
            <React.Fragment>
              <Table
                onRow={(record, rowIndex) => ({
                  onClick: () => this.props.history.push(`/functions/${record.id}`)
                })}
                columns={columns}
                dataSource={functions.entries}
                rowKey={record => record.id}
                pagination={false}
                rowClassName="clickable-row"
                style={{ minWidth: 800 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
                <Pagination
                  current={functions.pageNumber}
                  pageSize={functions.pageSize}
                  total={functions.totalEntries}
                  onChange={page => this.handleChangePage(page)}
                  style={{marginBottom: 20}}
                  showSizeChanger={false}
                />
              </div>
            </React.Fragment>
            </Card>
            </div>
          )
        }
      </div>
    )
  }
}


function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateFunction }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(FunctionIndexTable, PAGINATED_FUNCTIONS, props => ({ fetchPolicy: 'cache-and-network', variables: { page: 1, pageSize: 10 }, name: 'paginatedFunctionsQuery' }))
)
