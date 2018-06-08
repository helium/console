import React, { Component } from 'react'
import RandomChannelButton from './RandomChannelButton'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import ChannelCreateRow from './ChannelCreateRow'


//MUI
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';


class ChannelIndex extends Component {
  render() {
    return(
      <DashboardLayout title="All Channels">
        <UserCan action="create" itemType="channel">
          <Card>
            <CardContent>
              <Typography variant="headline" component="h3">
                Create New Channel
              </Typography>

              <ChannelCreateRow />
            </CardContent>
          </Card>
        </UserCan>

        <Paper style={{marginTop: 24}}>
          <ChannelsTable />
        </Paper>

        <UserCan action="create" itemType="channel">
          <RandomChannelButton />
        </UserCan>
      </DashboardLayout>
    )
  }
}

export default ChannelIndex
