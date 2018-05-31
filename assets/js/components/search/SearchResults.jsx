import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import find from 'lodash/find'

// MUI
import Portal from '@material-ui/core/Portal';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader'

// Icons
import DevicesIcon from '@material-ui/icons/Memory';
import GatewaysIcon from '@material-ui/icons/Router';
import ChannelsIcon from '@material-ui/icons/CompareArrows';
import AccessIcon from '@material-ui/icons/People';
import BillingIcon from '@material-ui/icons/CreditCard';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReportsIcon from '@material-ui/icons/TrackChanges';


class SearchResults extends Component {
  render() {
    const { results, selectedResult } = this.props
    const pageResults = find(results, r => r.index === "pages")
    const deviceResults = find(results, r => r.index === "devices")
    const gatewayResults = find(results, r => r.index === "gateways")
    const channelResults = find(results, r => r.index === "channels")

    return(
      <Portal container={this.container}>
        <Paper id="searchResults">

          <List component="nav" dense>
            {pageResults &&
              <PageSearchResults
                hits={pageResults.hits}
                selectedResult={selectedResult}
              />
            }
            {deviceResults &&
              <DeviceSearchResults
                hits={deviceResults.hits}
                selectedResult={selectedResult}
              />
            }
            {gatewayResults &&
              <GatewaySearchResults
                hits={gatewayResults.hits}
                selectedResult={selectedResult}
              />
            }
            {channelResults &&
              <ChannelSearchResults
                hits={channelResults.hits}
                selectedResult={selectedResult}
              />
            }
          </List>
        </Paper>
      </Portal>
    )
  }
}

const PageSearchResults = (props) => {
  const { hits, selectedResult } = props

  return (
    <div>
      <ListSubheader>PAGES</ListSubheader>
      {hits.map(hit =>
        <MenuItem
          key={hit.objectID}
          button
          component={Link}
          selected={selectedResult && selectedResult.objectID === hit.objectID}
          to={hit.url}
        >
          <ListItemIcon>
            {searchResultIcon(hit.category)}
          </ListItemIcon>
          <ListItemText
            primary={hit.title}
            secondary={hit.description}
          />
        </MenuItem>
      )}
    </div>
  )
}

const DeviceSearchResults = (props) => {
  const { hits, selectedResult } = props

  return (
    <div>
      <ListSubheader>DEVICES</ListSubheader>
      {hits.map(hit =>
        <MenuItem
          key={hit.objectID}
          button
          component={Link}
          selected={selectedResult && selectedResult.objectID === hit.objectID}
          to={hit.url}
        >
          <ListItemIcon>
            <DevicesIcon />
          </ListItemIcon>
          <ListItemText
            primary={hit.name}
            secondary={hit.mac}
          />
        </MenuItem>
      )}
    </div>
  )
}

const GatewaySearchResults = (props) => {
  const { hits, selectedResult } = props

  return (
    <div>
      <ListSubheader>GATEWAYS</ListSubheader>
      {hits.map(hit =>
        <MenuItem
          key={hit.objectID}
          button
          component={Link}
          selected={selectedResult && selectedResult.objectID === hit.objectID}
          to={hit.url}
        >
          <ListItemIcon>
            <GatewaysIcon />
          </ListItemIcon>
          <ListItemText
            primary={hit.name}
            secondary={hit.mac}
          />
        </MenuItem>
      )}
    </div>
  )
}

const ChannelSearchResults = (props) => {
  const { hits, selectedResult } = props

  return (
    <div>
      <ListSubheader>CHANNELS</ListSubheader>
      {hits.map(hit =>
        <MenuItem
          key={hit.objectID}
          button
          component={Link}
          selected={selectedResult && selectedResult.objectID === hit.objectID}
          to={hit.url}
        >
          <ListItemIcon>
            <ChannelsIcon />
          </ListItemIcon>
          <ListItemText
            primary={hit.name}
            secondary={hit.kind}
          />
        </MenuItem>
      )}
    </div>
  )
}

const searchResultIcon = (objectType) => {
  switch (objectType) {
    case "devices":
      return <DevicesIcon />
    case "gateways":
      return <GatewaysIcon />
    case "channels":
      return <ChannelsIcon />
    default:
      return <DevicesIcon />
  }
}

export default SearchResults
