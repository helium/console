import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import sample from 'lodash/sample'

// MUI
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader'
import { withStyles } from '@material-ui/core/styles';

// Icons
import DevicesIcon from '@material-ui/icons/Memory';
import GatewaysIcon from '@material-ui/icons/Router';
import ChannelsIcon from '@material-ui/icons/CompareArrows';
import AccessIcon from '@material-ui/icons/People';
import BillingIcon from '@material-ui/icons/CreditCard';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReportsIcon from '@material-ui/icons/TrackChanges';
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import AccountCircle from '@material-ui/icons/AccountCircle'

const styles = theme => ({
  subheader: {
    lineHeight: "32px",
    fontSize: "0.72rem",
    letterSpacing: "0.03rem",
  },
});

const SearchResultsSection = (props) => (
  <div>
    <ListSubheader className={props.classes.subheader}>{props.title}</ListSubheader>
    {props.results.map(result =>
      <SearchResult
        key={result.id}
        result={result}
        selected={props.selectedResult && props.selectedResult.id === result.id}
      />
    )}
  </div>
)

const SearchResult = (props) => (
  <MenuItem
    button
    component={Link}
    selected={props.selected}
    to={props.result.url}
  >
    <ListItemIcon>
      <SearchResultIcon category={props.result.category} />
    </ListItemIcon>
    <ListItemText
      primary={props.result.title}
      secondary={props.result.description}
    />
    <JumpTo show={props.selected} />
  </MenuItem>
)

const JumpTo = (props) => (
  <span className="jumpto">
    {props.show &&
      <span className="jumpto--inner">
        Jump to <KeyboardReturnIcon />
      </span>
    }
  </span>
)

const SearchResultIcon = (props) => {
  switch (props.category) {
    case "devices":
      return <DevicesIcon />
    case "gateways":
      return <GatewaysIcon />
    case "channels":
      return <ChannelsIcon />
    case "access":
      return <AccessIcon />
    case "dashboard":
      return <DashboardIcon />
    case "profile":
      return <AccountCircle />
    default:
      return <DevicesIcon />
  }
}

export default withStyles(styles)(SearchResultsSection)
