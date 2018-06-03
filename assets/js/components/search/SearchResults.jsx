import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import find from 'lodash/find'
import sample from 'lodash/sample'

// MUI
import Portal from '@material-ui/core/Portal';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader'
import Typography from '@material-ui/core/Typography'

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


class SearchResults extends Component {
  render() {
    const { searchResults, selectedResult, pageResults } = this.props
    const pageResultsLength = pageResults ? pageResults.length : 0
    const searchResultsLength = searchResults ? searchResults.length : 0

    if ((pageResultsLength + searchResultsLength) > 0) {
      return(
        <Portal container={this.container}>
          <Paper id="searchResults">
            <List component="nav" dense>
              {pageResultsLength > 0 &&
                <SearchResultsSection
                  title="PAGES"
                  results={pageResults}
                  selectedResult={selectedResult}
                />
              }

              {searchResultsLength > 0 &&
                <SearchResultsSection
                  title="SEARCH RESULTS"
                  results={searchResults}
                  selectedResult={selectedResult}
                />
              }
            </List>
          </Paper>
        </Portal>
      )
    } else {
      return(
        <Portal container={this.container}>
          <Paper id="searchResults">
            <Typography style={{textAlign: 'center', padding: 20, color: "#6a6a6a"}}>
              no results {reactionFace()}
            </Typography>
          </Paper>
        </Portal>
      )
    }

  }
}

const SearchResultsSection = (props) => (
  <div>
    <ListSubheader>{props.title}</ListSubheader>
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

const reactionFace = () => (
  sample([":(", ":'(", ":c", ":{", ":[", ">:("])
)

export default SearchResults
