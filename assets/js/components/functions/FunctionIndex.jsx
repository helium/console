import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import FunctionIndexTable from './FunctionIndexTable'
import DeleteFunctionModal from './DeleteFunctionModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

class FunctionIndex extends Component {
  state = {
    showDeleteFunctionModal: false,
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

  render() {
    const { showDeleteFunctionModal } = this.state

    return (
      <DashboardLayout
        title="My Functions"
        user={this.props.user}
        extra={
          <UserCan>
            <Button
              size="large"
              icon={<CodeOutlined />}
              style={{ borderRadius: 4 }}
              type="primary"
              onClick={() => this.props.history.push('/functions/new')}
            >
              Add Function
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
          functionToDelete={this.state.functionSelected}
        />
      </DashboardLayout>
    )
  }
}

export default FunctionIndex
