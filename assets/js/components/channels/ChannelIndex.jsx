import React, { Component } from 'react'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelCargoRow from './ChannelCargoRow'
import analyticsLogger from '../../util/analyticsLogger'


//MUI
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
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
class ChannelIndex extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_INDEX")
  }

  render() {
    const { classes } = this.props
    return(
      <DashboardLayout title="Channels">
        <UserCan action="create" itemType="channel">
          <Card>
            <CardContent>
              <Typography variant="headline" component="h3">
                Use Helium Cargo
              </Typography>

              <ChannelCargoRow />

              <Typography variant="headline" component="h3" style={{ marginTop: 12 }}>
                Create New Channel
              </Typography>

              <ChannelCreateRow />
            </CardContent>
          </Card>
        </UserCan>

        <Paper style={{marginTop: 24}} className={classes.paper}>
          <header className={classes.header}>
            <Typography variant="headline" component="h3">
              Channels
            </Typography>
          </header>

          <ChannelsTable />
        </Paper>
      </DashboardLayout>
    )
  }
}

export default ChannelIndex
