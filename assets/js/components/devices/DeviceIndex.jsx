import React, { Component } from 'react'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'

// MUI
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
})

@withStyles(styles)
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
        <Paper className={classes.paper}>
          <header className={classes.header}>
            <Typography variant="headline" component="h3">
              Devices
            </Typography>

            <UserCan action="create" itemType="device">
              <Button
                color="primary"
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_NEW_DEVICE")
                  this.setState({ showModal: true })
                }}
              >
                + New
              </Button>
            </UserCan>
          </header>

          <DevicesTable />
        </Paper>

        <NewDeviceModal open={showModal} onClose={this.handleClose}/>
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
