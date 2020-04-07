import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';

class FunctionIndex extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_FUNCTIONS_INDEX")
  }

  render() {
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
        <Card title="My Functions" bodyStyle={{ overflowX: 'scroll' }}>

        </Card>
      </DashboardLayout>
    )
  }
}

export default FunctionIndex
