import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import UserCan from '../common/UserCan'
import FunctionNew from './FunctionNew'
import { updateFunction } from '../../actions/function'
import { PAGINATED_FUNCTIONS } from '../../graphql/functions'
import analyticsLogger from '../../util/analyticsLogger'
import withGql from '../../graphql/withGql'
import FunctionsImg from '../../../img/functions.svg'
import { Table, Button, Pagination, Typography, Card, Switch } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { SkeletonLayout } from '../common/SkeletonLayout';
import NavPointTriangle from '../common/NavPointTriangle';
import HomeIcon from '../../../img/functions/function-index-home-icon.svg'
import PlusIcon from '../../../img/functions/function-index-plus-icon.svg'
import AllIcon from '../../../img/functions/function-index-all-icon.svg'
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
    showPage: "allFunctions"
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:function_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:function_index_table:${currentOrganizationId}:function_list_update`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    })

    if (!this.props.paginatedFunctionsQuery.loading) {
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
    const { refetch } = this.props.paginatedFunctionsQuery
    refetch({ page, pageSize })
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
    const { showPage} = this.state

    return (
      <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: 6, overflow: 'hidden', boxShadow: '0px 20px 20px -7px rgba(17, 24, 31, 0.19)' }}>
        <div style={{ padding: 20, backgroundColor: '#DCD3EE', display: 'flex', flexDirection: 'row', overflowX: 'scroll' }}>
          <div
            style={{
              backgroundColor: '#B39FDA',
              borderRadius: 6,
              padding: 10,
              cursor: 'pointer',
              height: 50,
              width: 50,
              minWidth: 50,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
              position: 'relative'
            }}
            onClick={() => this.setState({ showPage: 'home'})}
          >
            <img src={HomeIcon} style={{ height: 20, paddingLeft: 2 }} />
            {showPage === 'home' && <NavPointTriangle />}
          </div>

          <div style={{
            backgroundColor: '#B39FDA',
            borderRadius: 6,
            padding: '5px 10px 5px 10px',
            cursor: 'pointer',
            height: 50,
            width: 120,
            minWidth: 120,
            display: 'flex',
            flexDirection: 'column',
            marginRight: 12,
            position: 'relative'
          }} onClick={() => this.setState({ showPage: 'allFunctions'})}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <img src={AllIcon} style={{ height: 12, marginRight: 4 }} />
              <Text style={{ color: '#8261C2', fontWeight: 500, whiteSpace: 'nowrap' }}>All Functions</Text>
            </div>
            <Text style={{ color: '#8261C2', fontSize: 10, whiteSpace: 'nowrap' }}>{functions && functions.totalEntries} Functions</Text>
            {showPage === 'allFunctions' && <NavPointTriangle />}
          </div>

          <div style={{
            backgroundColor: '#B39FDA',
            borderRadius: 6,
            padding: 10,
            cursor: 'pointer',
            height: 50,
            width: 50,
            minWidth: 50,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            whiteSpace: 'nowrap',
            position: 'relative'
          }} onClick={() => this.setState({ showPage: 'new'})}>
            <img src={PlusIcon} style={{ height: 20 }} />
            {showPage === 'new' && <NavPointTriangle />}
          </div>
        </div>
        {
          showPage === "home" && (
            <div className="blankstateWrapper">
              <div className="message">
              <img src={FunctionsImg} />
              <h1>Functions</h1>

              <div className="explainer">
                <p>Functions are operators that can be applied to devices and labels. They act on the data of these linked devices and labels.</p>
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
              padding: 20px 60px 1px 60px;
              border-radius: 20px;
              text-align: center;
              margin-top: 20px;
              box-sizing: border-box;
              border: none;
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
              margin-bottom: 10px;
            }
            `}</style>

          </div>
          )
        }
        {
          showPage === 'allFunctions' && error && <Text>Data failed to load, please reload the page and try again</Text>
        }
        {
          showPage === 'allFunctions' && loading && <div style={{ padding: 40 }}><SkeletonLayout /></div>
        }
        {
          showPage === 'allFunctions' && !loading && (
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
            </div>
          )
        }
        {
          showPage === 'new' && <FunctionNew />
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
  withGql(FunctionIndexTable, PAGINATED_FUNCTIONS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'paginatedFunctionsQuery' }))
)
