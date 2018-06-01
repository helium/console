import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteDevice } from '../../actions/device'
import RandomDeviceButton from './RandomDeviceButton'
import DevicesTable from './DevicesTable'
import DashboardLayout from '../common/DashboardLayout'
import BlankSlate from '../common/BlankSlate'
import userCan from '../../util/abilities'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

class DeviceIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: 10
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
  }

  handleChangeRowsPerPage(pageSize) {
    this.setState({ pageSize, page: 1 })
    const { fetchMore } = this.props.data

    fetchMore({
      variables: { page: 1, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  handleChangePage(page) {
    this.setState({ page })
    const { fetchMore } = this.props.data
    const { pageSize } = this.state

    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { deleteDevice } = this.props
    const { loading, devices } = this.props.data

    if (loading) return <DashboardLayout title={"All Devices"} />

    return(
      <DashboardLayout title={"All Devices"}>
        <Paper>
        </Paper>
        <Paper>
          {devices.entries.length === 0 ? (
            <BlankSlate
              title="No devices"
              subheading="To create a new device, click the red button in the corner"
            />
          ) : (
            <DevicesTable
              devices={devices.entries}
              deleteDevice={deleteDevice}
              totalEntries={devices.totalEntries}
              page={this.state.page}
              pageSize={this.state.pageSize}
              handleChangePage={this.handleChangePage}
              handleChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          ) }
        </Paper>

        {userCan('create', 'device') &&
          <RandomDeviceButton />
        }
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevice }, dispatch);
}

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    }
  })
}

const query = gql`
  query PaginatedDevicesQuery ($page: Int, $pageSize: Int) {
    devices(page: $page, pageSize: $pageSize) {
      entries {
        name,
        mac,
        id
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

const DeviceIndexWithData = graphql(query, queryOptions)(DeviceIndex)

export default connect(mapStateToProps, mapDispatchToProps)(DeviceIndexWithData);
