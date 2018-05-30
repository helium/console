
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import findIndex from 'lodash/findIndex'

// MUI
import Portal from '@material-ui/core/Portal';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListSubheader from '@material-ui/core/ListSubheader'

// Icons
import SearchIcon from '@material-ui/icons/Search'
import DevicesIcon from '@material-ui/icons/Memory';
import GatewaysIcon from '@material-ui/icons/Router';
import ChannelsIcon from '@material-ui/icons/CompareArrows';
import AccessIcon from '@material-ui/icons/People';
import BillingIcon from '@material-ui/icons/CreditCard';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReportsIcon from '@material-ui/icons/TrackChanges';

const initialResults = [
  {
    objectID: "f8b8afcc-3bbb-468c-bfd5-f627bd23d848",
    url: "/devices/f8b8afcc-3bbb-468c-bfd5-f627bd23d848",
    primary: "Fiery Cactus",
    secondary: "C9839439B4E5",
    objectType: "devices"
  },
  {
    objectID: "736c67f1-89a0-4959-af79-af001e0edf8b",
    url: "/gateways/736c67f1-89a0-4959-af79-af001e0edf8b",
    primary: "Frightening Shelf",
    secondary: "05938C1BD7A9",
    objectType: "gateways"
  },
  {
    objectID: "c6ad8a4f-9476-4260-9fe1-e0783559622a",
    url: "/channels/c6ad8a4f-9476-4260-9fe1-e0783559622a",
    primary: "Sudden Plate",
    secondary: "AWS IoT",
    objectType: "channels"
  }
]

const SearchResultIcon = (props) => {
  switch (props.objectType) {
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

class SearchBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: "",
      open: false,
      results: initialResults,
      selectedResult: null
    }

    this.container = null
    this.searchBarInput = React.createRef()
    this.handleUpdateQuery = this.handleUpdateQuery.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.focusSearchBar = this.focusSearchBar.bind(this)
    this.isSearchBarFocused = this.isSearchBarFocused.bind(this)
    this.nextResult = this.nextResult.bind(this)
    this.previousResult = this.previousResult.bind(this)
    this.gotoCurrentResult = this.gotoCurrentResult.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  handleKeydown(event) {
    if (document.activeElement.tagName === "INPUT") return
    if (document.activeElement.tagName === "TEXTAREA") return
    const focused = this.isSearchBarFocused()

    if (event.key === '/') {
      event.preventDefault()
      this.focusSearchBar()
    }

    if (focused && (event.key === 'ArrowDown' || event.key === 'ArrowRight')) {
    }

    console.log(event.key)
  }

  handleUpdateQuery(e) {
    this.setState({
      query: e.target.value,
      open: e.target.value.length > 0
    })
  }

  focusSearchBar() {
    this.searchBarInput.current.focus()
  }

  isSearchBarFocused() {
    this.searchBarInput.current === document.activeElement
  }

  nextResult() {
    const { currentResult, results } = this.state
    const resultIndex = findIndex(results, r => currentResult && r.objectID === currentResult.objectID)
    const result = results[resultIndex + 1]
    this.setState({
      selectedResult: result
    })
  }

  previousResult() {
  }

  gotoCurrentResult() {
  }

  render() {
    const { query, open, results, selectedResult } = this.state

    return (
      <div>
        <div onClick={this.focusSearchBar} id="searchBar">
          <SearchIcon />
          <input
            ref={this.searchBarInput}
            value={query}
            onChange={this.handleUpdateQuery}
          />
        </div>

        {open && (
          <Portal container={this.container}>
            <Paper id="searchResults">

              <List component="nav" dense>
                <ListSubheader>Devices</ListSubheader>
                {results.map(result =>
                  <MenuItem
                    key={result.objectID}
                    button
                    component={Link}
                    selected={selectedResult && selectedResult.objectID === result.objectID}
                    to={result.url}
                  >
                    <ListItemIcon>
                      <SearchResultIcon objectType={result.objectType} />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.primary}
                      secondary={result.secondary}
                    />
                  </MenuItem>
                )}
                <ListSubheader>Gateways</ListSubheader>
                {results.map(result =>
                  <MenuItem
                    key={result.objectID}
                    button
                    component={Link}
                    selected={selectedResult && selectedResult.objectID === result.objectID}
                    to={result.url}
                  >
                    <ListItemIcon>
                      <SearchResultIcon objectType={result.objectType} />
                    </ListItemIcon>
                    <ListItemText
                      primary={result.primary}
                      secondary={result.secondary}
                    />
                  </MenuItem>
                )}
              </List>
            </Paper>
          </Portal>
        )}
      </div>
    )
  }
}

export default SearchBar
