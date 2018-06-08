import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import RandomGatewayButton from './RandomGatewayButton'
import GatewaysTable from './GatewaysTable'
import DashboardLayout from '../common/DashboardLayout'
import UserCan from '../common/UserCan'
import GatewaysMap from './GatewaysMap'

// MUI
import Paper from '@material-ui/core/Paper';

class GatewayIndex extends Component {
  render() {
    const listView = (
      <Paper>
        <GatewaysTable />
      </Paper>
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
