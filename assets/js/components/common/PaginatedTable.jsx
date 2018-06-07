import React, { Component } from 'react'

// GraphQL
import { Query } from 'react-apollo';

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooterPagination from './TableFooterPagination'
import Button from '@material-ui/core/Button';

import { Link } from 'react-router-dom'
const randomCity = () => (
  sample([
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
    "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
    "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL",
    "San Francisco, CA"
  ])
)
import random from 'lodash/random'
import sample from 'lodash/sample'
import userCan from '../../util/abilities'

const variables = {
  page: 1,
  pageSize: 10
}

class PaginatedTable extends Component {

  render() {
    const { query } = this.props

    return(
      <Query query={query} variables={variables}>
        {({ loading, error, data, fetchMore }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            fetchMore={fetchMore}
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
      pageSize: 10
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.refetchPaginatedDevices = this.refetchPaginatedDevices.bind(this)
    this.handleSubscriptionDeviceAdded = this.handleSubscriptionDeviceAdded.bind(this)
  }

  handleChangeRowsPerPage(pageSize) {
    this.setState({ pageSize, page: 1 })

    this.refetchPaginatedDevices(1, pageSize)
  }

  handleChangePage(page) {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedDevices(page, pageSize)
  }

  handleSubscriptionDeviceAdded() {
    const { page, pageSize } = this.state
    this.refetchPaginatedDevices(page, pageSize)
  }

  refetchPaginatedDevices(page, pageSize) {
    const { fetchMore } = this.props
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { loading, error, data } = this.props

    if (loading) return null;
    if (error) return `Error!: ${error}`;

    return (
      <ResultsTable
        results={data.devices}
        handleChangePage={this.handleChangePage}
        handleChangeRowsPerPage={this.handleChangeRowsPerPage}
      />
    )
  }
}

const ResultsTable = (props) => {
  const { entries, pageNumber, pageSize, totalEntries, totalPages } = props.results
  const {handleChangePage, handleChangeRowsPerPage} = props

  return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>MAC</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Bid</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(device => {
              return (
                <TableRow key={device.id}>
                  <TableCell>
                    <Link to={`/devices/${device.id}`}>{device.name}</Link>
                  </TableCell>

                  <TableCell>
                    {device.mac}
                  </TableCell>

                  <TableCell>
                    {randomCity()}
                  </TableCell>

                  <TableCell>
                    {random(0, 1000).toLocaleString()} HLM
                  </TableCell>

                  <TableCell>
                    {random(0.01, 5.0).toFixed(2)} HLM
                  </TableCell>

                  <TableCell numeric>
                    <Button
                      color="primary"
                      component={Link}
                      to={`/devices/${device.id}`}
                      size="small"
                    >
                      View
                    </Button>

                    {userCan('delete', 'device', device) &&
                      <Button
                        color="secondary"
                        onClick={() => deleteDevice(device)}
                        size="small"
                      >
                        Delete
                      </Button>
                    }
                  </TableCell>
                </TableRow>
              );
            })}
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

export default PaginatedTable
