import React, { Component } from 'react'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Button } from 'antd';
import { Card } from 'antd';

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
}

class DeviceIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModal: false
    }
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DEVICES_INDEX")
  }

  handleClose() {
    this.setState({ showModal: false })
  }

  render() {
    const { showModal } = this.state
    const { classes } = this.props
    return(
      <DashboardLayout title="Devices">
      <Card title="Device List" bodyStyle={{padding: 0, paddingTop: 20}}>
        <header style={styles.header}>
          <UserCan action="create" itemType="device" >
            <Button
            icon="plus"
            style={{marginBottom: 20}}
              onClick={() => {
                analyticsLogger.logEvent("ACTION_NEW_DEVICE")
                this.setState({ showModal: true })
              }}
              type="primary"
            >
              Add New Device
            </Button>
          </UserCan>
        </header>

        <DevicesTable />

        <NewDeviceModal open={showModal} onClose={this.handleClose}/>
        </Card>
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
