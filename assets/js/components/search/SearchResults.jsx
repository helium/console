import React, { Component } from 'react'
import SearchResultsSection from './SearchResultsSection'

// MUI
import Portal from '@material-ui/core/Portal';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography'

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

const reactionFace = () => (
  sample([":(", ":'(", ":c", ":{", ":[", ">:("])
)

export default SearchResults
