import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import SearchResult from './SearchResult'

// MUI
import ListSubheader from '@material-ui/core/ListSubheader'
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  subheader: {
    lineHeight: "32px",
    fontSize: "0.72rem",
    letterSpacing: "0.03rem",
  },
});

@withStyles(styles)
class SearchResultsSection extends Component {
  render() {
    const { title, results, selectedResult, classes } = this.props

    return (
      <div>
        <ListSubheader className={classes.subheader}>{title}</ListSubheader>
        {results.map(result =>
          <SearchResult
            key={result.id}
            result={result}
            selected={selectedResult && selectedResult.id === result.id}
          />
        )}
      </div>
    )
  }
}

export default SearchResultsSection
