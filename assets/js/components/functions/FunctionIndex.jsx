import React, { Component } from 'react'
import { connect } from 'react-redux';
import withGql from '../../graphql/withGql'
import { MobileDisplay, DesktopDisplay } from '../mobile/MediaQuery'
import { PAGINATED_FUNCTIONS } from '../../graphql/functions'
import FunctionDashboardLayout from './FunctionDashboardLayout'
import FunctionIndexTable from './FunctionIndexTable'
import DeleteFunctionModal from './DeleteFunctionModal'
import analyticsLogger from '../../util/analyticsLogger'
import { SkeletonLayout } from '../common/SkeletonLayout';
import { Typography } from 'antd';
const { Text } = Typography

class FunctionIndex extends Component {
  state = {
    functionSelected: null,
    page: 1,
    pageSize: 10,
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
    const { showDeleteFunctionModal } = this.state

    return (
      <>
        <MobileDisplay />
        <DesktopDisplay>
          <FunctionDashboardLayout {...this.props}>
            {
              error && <Text>Data failed to load, please reload the page and try again</Text>
            }
            {
              loading && <div style={{ padding: 40 }}><SkeletonLayout /></div>
            }
            {
              !loading && (
                <FunctionIndexTable
                  history={this.props.history}
                  functions={functions}
                  openDeleteFunctionModal={this.openDeleteFunctionModal}
                  handleChangePage={this.handleChangePage}
                />
              )
            }
            <DeleteFunctionModal
              open={showDeleteFunctionModal}
              onClose={this.closeDeleteFunctionModal}
              functionToDelete={this.state.functionSelected}
            />
          </FunctionDashboardLayout>
        </DesktopDisplay>
      </>
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
