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
import { DEVICE_SUBSCRIPTION, DEVICE_FRAGMENT } from '../../graphql/devices'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

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
        ...DeviceFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${DEVICE_FRAGMENT}
`

@connect(mapStateToProps, mapDispatchToProps)
@graphql(query, queryOptions)
class DeviceIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: 10
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.handleSubscriptionDeviceAdded = this.handleSubscriptionDeviceAdded.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: DEVICE_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionDeviceAdded()
      }
    })
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
    const { fetchMore } = this.props.data
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

export default DeviceIndex
