import React, { Component } from 'react'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Button } from 'antd';

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
        <header style={styles.header}>
          <UserCan action="create" itemType="device">
            <Button
              onClick={() => {
                analyticsLogger.logEvent("ACTION_NEW_DEVICE")
                this.setState({ showModal: true })
              }}
            >
              New Device
            </Button>
          </UserCan>
        </header>

        <DevicesTable />

        <NewDeviceModal open={showModal} onClose={this.handleClose}/>
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
