import React, { Component } from 'react'
import find from 'lodash/find'
import merge from 'lodash/merge'

// GraphQL
import { Query } from 'react-apollo';

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooterPagination from './TableFooterPagination'


const defaultVariables = {
  page: 1,
  pageSize: 10
}

class PaginatedTable extends Component {

  render() {
    const { query, columns, subscription, EmptyComponent, pageSize } = this.props
    const variables = merge({}, defaultVariables, { pageSize })

    return(
      <Query query={query} variables={variables}>
        {({ loading, error, data, fetchMore, subscribeToMore }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            columns={columns}
            subscription={subscription}
            EmptyComponent={EmptyComponent}
            pageSize={pageSize}
          />
        )}
      </Query>
    )
  }
}

class QueryResults extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: props.pageSize || 10
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.refetchPaginatedEntries = this.refetchPaginatedEntries.bind(this)
    this.handleSubscriptionAdded = this.handleSubscriptionAdded.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore, subscription } = this.props

    subscribeToMore({
      document: subscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
      }
    })
  }

  handleChangeRowsPerPage(pageSize) {
    this.setState({ pageSize, page: 1 })

    this.refetchPaginatedEntries(1, pageSize)
  }

  handleChangePage(page) {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleSubscriptionAdded() {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries(page, pageSize) {
    const { fetchMore } = this.props
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { loading, error, data, columns, EmptyComponent } = this.props

    if (loading) return null;
    if (error) return `Error!: ${error}`;

    const results = find(data, d => d.entries !== undefined)

    if (results.entries.length === 0 && EmptyComponent) return (
      <EmptyComponent />
    )

    return (
      <ResultsTable
        columns={columns}
        results={results}
        handleChangePage={this.handleChangePage}
        handleChangeRowsPerPage={this.handleChangeRowsPerPage}
      />
    )
  }
}

const ResultsTable = (props) => {
  const { handleChangePage, handleChangeRowsPerPage, columns } = props
  const { pageNumber, pageSize, totalEntries, totalPages } = props.results
  const rows = props.results.entries

  return (
    <Table>
      <TableHead>
        <TableRow>
          {columns.map((column, i) =>
            <TableCell key={`header-${i}`}>{column.Header}</TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(row =>
          <PaginatedRow key={row.id} row={row} columns={columns} />
        )}
      </TableBody>
      <TableFooterPagination
        totalEntries={totalEntries}
        page={pageNumber}
        pageSize={pageSize}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Table>
  )
}

const PaginatedRow = (props) => {
  const { row, columns } = props
  return (
    <TableRow>
      {columns.map((column, i) =>
        <PaginatedCell key={`${row.id}-${i}`} row={row} column={column} />
      )}
    </TableRow>
  )
}

const PaginatedCell = (props) => {
  const { row, column } = props
  const { Cell } = column
  const value = row[column.accessor]

  if (Cell) return (
    <TableCell>
      <Cell row={row} value={value} />
    </TableCell>
  )

  return (
    <TableCell>
      {value}
    </TableCell>
  )
}

export default PaginatedTable
