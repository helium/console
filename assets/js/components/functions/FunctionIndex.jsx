import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import FunctionIndexTable from './FunctionIndexTable'
import DeleteFunctionModal from './DeleteFunctionModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';

class FunctionIndex extends Component {
  state = {
    showDeleteFunctionModal: false,
    functionToDelete: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_INDEX")
  }

  openDeleteFunctionModal = (functionToDelete) => {
    this.setState({ showDeleteFunctionModal: true, functionToDelete })
  }

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false })
  }

  render() {
    const { showDeleteFunctionModal } = this.state

    return (
      <DashboardLayout
        title="Functions"
        extra={
          <UserCan>
            <Button
              size="large"
              icon="code"
              type="primary"
              onClick={() => this.props.history.push('/functions/new')}
            >
              Create New Function
            </Button>
          </UserCan>
        }
      >
        <FunctionIndexTable
          history={this.props.history}
          openDeleteFunctionModal={this.openDeleteFunctionModal}
        />

        <DeleteFunctionModal
          open={showDeleteFunctionModal}
          onClose={this.closeDeleteFunctionModal}
          functionToDelete={this.state.functionToDelete}
        />
      </DashboardLayout>
    )
  }
}

export default FunctionIndex
