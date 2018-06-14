import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import RandomGatewayButton from './RandomGatewayButton'
import GatewaysTable from './GatewaysTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import GatewaysMap from './GatewaysMap'
import GatewayCreateRow from './GatewayCreateRow'

// MUI
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

class GatewayIndex extends Component {
  render() {
    const listView = (
      <div>
        <UserCan action="create" itemType="gateway">
          <Card style={{marginBottom: 24}}>
            <CardContent>
              <Typography variant="headline" component="h3">
                Register New Gateway
              </Typography>

              <GatewayCreateRow />
            </CardContent>
          </Card>
        </UserCan>

        <Paper>
          <GatewaysTable />
        </Paper>
      </div>
    )

    const mapView = (
      <Paper>
        <GatewaysMap />
      </Paper>
    )

    const tabs = [{
      label: "List View",
      content: listView,
      path: "/gateways",
    }, {
      label: "Map View",
      content: mapView,
      noPadding: true,
      path: "/gateways/map",
    }]

    return(
      <DashboardLayout title="All Gateways" tabs={tabs}>
        <UserCan action="create" itemType="gateway">
          <RandomGatewayButton />
        </UserCan>
      </DashboardLayout>
    )
  }
}

export default GatewayIndex
