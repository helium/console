import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import AddResourceButton from '../common/AddResourceButton'
import { connect } from 'react-redux';
import withGql from '../../graphql/withGql'
import { PAGINATED_FUNCTIONS } from '../../graphql/functions'
import FunctionNew from './FunctionNew'
import FunctionBar from './FunctionBar'
import FunctionIndexTable from './FunctionIndexTable'
import DeleteFunctionModal from './DeleteFunctionModal'
import analyticsLogger from '../../util/analyticsLogger'
import { SkeletonLayout } from '../common/SkeletonLayout';
import NavPointTriangle from '../common/NavPointTriangle';
import HomeIcon from '../../../img/functions/function-index-home-icon.svg'
import PlusIcon from '../../../img/functions/function-index-plus-icon.svg'
import AllIcon from '../../../img/functions/function-index-all-icon.svg'
import _JSXStyle from "styled-jsx/style"
import { Typography } from 'antd';
import TableHeader from '../common/TableHeader';
const { Text } = Typography

class FunctionIndex extends Component {
  state = {
    functionSelected: null,
    page: 1,
    pageSize: 10,
    showPage: "allFunctions",
    showDeleteFunctionModal: false,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_INDEX")

    this.channel = socket.channel("graphql:function_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:function_index_table:${currentOrganizationId}:function_list_update`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    })

    if (!this.props.paginatedFunctionsQuery.loading) {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    }

    if (this.props.history.location.search === '?show_new=true') {
      this.setState({ showPage: "new" })
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

  openDeleteFunctionModal = (functionSelected) => {
    this.setState({ showDeleteFunctionModal: true, functionSelected })
  }

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false })
  }

  render() {
    const { functions, loading, error } = this.props.paginatedFunctionsQuery
    const { showPage, showDeleteFunctionModal } = this.state

    return (
      <DashboardLayout
        title="My Functions"
        user={this.props.user}
        noAddButton
      >
        <TableHeader
          backgroundColor='#DCD3EE'
          goHome={() => { this.setState({ showPage: 'home' })}}
          otherColor='#B39FDA'
          homeIcon={HomeIcon}
          goToAll={() => { this.setState({ showPage: 'allFunctions'})}}
          allIcon={AllIcon}
          textColor='#8261C2'
          allText='All Functions'
          allSubtext={functions && functions.totalEntries + ' Functions'}
          onHomePage={showPage === 'home'}
          onAllPage={showPage === 'allFunctions'}
          onNewPage={showPage === 'new'}
          addIcon={PlusIcon}
          goToNew={() => { this.setState({ showPage: 'new' })}}
          allButtonStyles={{ width: 120, minWidth: 120 }}
          extraContent={functions && <FunctionBar shownFunctionId={this.props.match.params.id} functions={functions.entries || []} />}
        >
          {
            showPage === "home" && (
              <div className="blankstateWrapper">
                <div className="message">
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
              <FunctionIndexTable
                history={this.props.history}
                functions={functions}
                openDeleteFunctionModal={this.openDeleteFunctionModal}
                handleChangePage={this.handleChangePage}
              />
            )
          }
          {
            showPage === 'new' && <FunctionNew />
          }
        </TableHeader>

        <DeleteFunctionModal
          open={showDeleteFunctionModal}
          onClose={this.closeDeleteFunctionModal}
          functionToDelete={this.state.functionSelected}
        />

        <AddResourceButton functionCallback={() => this.setState({ showPage: 'new' })} />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(FunctionIndex, PAGINATED_FUNCTIONS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'paginatedFunctionsQuery' }))
)
