import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import findIndex from 'lodash/findIndex'
import flatten from 'lodash/flatten'
import last from 'lodash/last'
import SearchResults from './SearchResults'
import searchPages from './pages'

// Icons
import SearchIcon from '@material-ui/icons/Search'

const initialResults = [
  {
    index: "devices",
    hits: [
      {
        objectID: "f8b8afcc-3bbb-468c-bfd5-f627bd23d848",
        url: "/devices/f8b8afcc-3bbb-468c-bfd5-f627bd23d848",
        name: "Fiery Cactus",
        mac: "C9839439B4E5",
      },
    ]
  },
  {
    index: "gateways",
    hits: [
      {
        objectID: "736c67f1-89a0-4959-af79-af001e0edf8b",
        url: "/gateways/736c67f1-89a0-4959-af79-af001e0edf8b",
        name: "Frightening Shelf",
        mac: "05938C1BD7A9",
      },
    ]
  },
  {
    index: "channels",
    hits: [
      {
        objectID: "c6ad8a4f-9476-4260-9fe1-e0783559622a",
        url: "/channels/c6ad8a4f-9476-4260-9fe1-e0783559622a",
        name: "Sudden Plate",
        kind: "AWS IoT",
      }
    ]
  },
]

const flattenResults = (pageResults, results) => (
  pageResults.concat(flatten(results.map(r => r.hits)))
)

class SearchBar extends Component {
  constructor(props) {
    super(props)


    this.state = {
      query: "",
      open: false,
      results: initialResults,
      selectedResult: null,
      pageResults: [],
      flatResults: flattenResults([], initialResults)
    }

    this.container = null
    this.searchBarInput = React.createRef()
    this.handleUpdateQuery = this.handleUpdateQuery.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.focusSearchBar = this.focusSearchBar.bind(this)
    this.nextResult = this.nextResult.bind(this)
    this.previousResult = this.previousResult.bind(this)
    this.clearResults = this.clearResults.bind(this)
    this.gotoSelecetedResult = this.gotoSelectedResult.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  handleKeydown(event) {
    if (this.state.open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault()
        this.nextResult()
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault()
        this.previousResult()
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        this.gotoSelectedResult()
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        this.clearResults()
      }
    }

    // Disable the following keyboard shortcuts when the user is typing
    if (document.activeElement.tagName === "INPUT") return
    if (document.activeElement.tagName === "TEXTAREA") return

    if (event.key === '/') {
      event.preventDefault()
      this.focusSearchBar()
    }
  }

  handleUpdateQuery(e) {
    const newQuery = e.target.value
    const { results } = this.state
    const pageResults = searchPages(newQuery)
    const newResults = results // TODO this will update when backend is ready

    this.setState({
      query: newQuery,
      open: newQuery.length > 0,
      results: newResults,
      pageResults,
      flatResults: flattenResults(pageResults, newResults)
    })
  }

  focusSearchBar() {
    this.searchBarInput.current.focus()
  }

  nextResult() {
    const { selectedResult, flatResults } = this.state
    const resultIndex = findIndex(flatResults, r => selectedResult && r.objectID === selectedResult.objectID)
    const result = flatResults[resultIndex + 1]
    this.setState({
      selectedResult: result
    })
  }

  previousResult() {
    const { selectedResult, flatResults } = this.state
    const resultIndex = findIndex(flatResults, r => selectedResult && r.objectID === selectedResult.objectID)
    const result = resultIndex >= 0 ? flatResults[resultIndex - 1] : last(flatResults)
    this.setState({
      selectedResult: result
    })
  }

  clearResults() {
    this.searchBarInput.current.blur()
    this.setState({
      query: "",
      open: false,
      selectedResult: null
    })
  }

  gotoSelectedResult() {
    const { selectedResult } = this.state
    this.props.history.replace(selectedResult.url)
  }

  render() {
    const { query, open, results, selectedResult, pageResults } = this.state

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

        {open && <SearchResults
          results={results}
          pageResults={pageResults}
          selectedResult={selectedResult}
        /> }
      </div>
    )
  }
}

export default withRouter(SearchBar)
