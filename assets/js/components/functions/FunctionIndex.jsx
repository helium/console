import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import FunctionIndexTable from './FunctionIndexTable'
import DeleteFunctionModal from './DeleteFunctionModal'
import RemoveFunctionLabelModal from './RemoveFunctionLabelModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';

class FunctionIndex extends Component {
  state = {
    showDeleteFunctionModal: false,
    showRemoveFunctionLabelModal: false,
    functionSelected: null,
    labelToRemove: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_INDEX")
  }

  openDeleteFunctionModal = (functionSelected) => {
    this.setState({ showDeleteFunctionModal: true, functionSelected })
  }

  closeDeleteFunctionModal = () => {
    this.setState({ showDeleteFunctionModal: false })
  }

  openRemoveFunctionLabelModal = (functionSelected, labelToRemove) => {
    this.setState({ showRemoveFunctionLabelModal: true, functionSelected, labelToRemove })
  }

  closeRemoveFunctionLabelModal = () => {
    this.setState({ showRemoveFunctionLabelModal: false })
  }

  render() {
    const { showDeleteFunctionModal, showRemoveFunctionLabelModal } = this.state

    if (!process.env.SELF_HOSTED) {
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
            openRemoveFunctionLabelModal={this.openRemoveFunctionLabelModal}
          />

          <DeleteFunctionModal
            open={showDeleteFunctionModal}
            onClose={this.closeDeleteFunctionModal}
            functionToDelete={this.state.functionSelected}
          />

          <RemoveFunctionLabelModal
            open={showRemoveFunctionLabelModal}
            onClose={this.closeRemoveFunctionLabelModal}
            functionSelected={this.state.functionSelected}
            labelToRemove={this.state.labelToRemove}
          />
        </DashboardLayout>
      )
    } else {
      return null
    }
  }
}

export default FunctionIndex
