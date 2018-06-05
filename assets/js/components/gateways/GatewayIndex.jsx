import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteGateway } from '../../actions/gateway'
import RandomGatewayButton from './RandomGatewayButton'
import GatewaysTable from './GatewaysTable'
import DashboardLayout from '../common/DashboardLayout'
import BlankSlate from '../common/BlankSlate'
import Mapbox from '../common/Mapbox'
import userCan from '../../util/abilities'
import { GATEWAY_SUBSCRIPTION, GATEWAY_FRAGMENT } from '../../graphql/gateways'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import AppBar from '@material-ui/core/AppBar'
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography';

class GatewayIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: 10
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.handleSubscriptionGatewayAdded = this.handleSubscriptionGatewayAdded.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: GATEWAY_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionGatewayAdded()
      }
    })
  }

  handleChangeRowsPerPage(pageSize) {
    this.setState({ pageSize, page: 1 })

    this.refetchPaginatedGateways(1, pageSize)
  }

  handleChangePage(page) {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedGateways(page, pageSize)
  }

  handleSubscriptionGatewayAdded() {
    const { page, pageSize } = this.state

    this.refetchPaginatedGateways(page, pageSize)
  }

  refetchPaginatedGateways(page, pageSize) {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { deleteGateway } = this.props
    const { loading, gateways } = this.props.data

    if (loading) return <DashboardLayout title={"All Gateways"} />

    if (gateways.length === 0) {
      return (
        <DashboardLayout title="All Gateways" tabs={tabs}>
          <Paper>
            <BlankSlate
              title="No gateways"
              subheading="To create a new gateway, click the red button in the corner"
            />
            {userCan('create', 'gateway') &&
              <RandomGatewayButton />
            }
          </Paper>
        </DashboardLayout>
      )
    }

    const listView = (
      <Paper>
        <GatewaysTable
          gateways={gateways.entries}
          deleteGateway={deleteGateway}
          totalEntries={gateways.totalEntries}
          page={this.state.page}
          pageSize={this.state.pageSize}
          handleChangePage={this.handleChangePage}
          handleChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    )

    const mapView = (
      <Paper>
        <Mapbox type={"gateways"} view={"index"} gateways={gateways.entries}/>
      </Paper>
    )

    const tabs = [{
      label: "List View",
      content: listView,
      path: "/gateways",
    }, {
      label: "Map View",
      content: mapView,
      noPadding: true,
      path: "/gateways/map",
    }]

    return(
      <DashboardLayout title="All Gateways" tabs={tabs}>
        {userCan('create', 'gateway') &&
          <RandomGatewayButton />
        }
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteGateway }, dispatch);
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
  query PaginatedGatewaysQuery ($page: Int, $pageSize: Int) {
    gateways(page: $page, pageSize: $pageSize) {
      entries {
        ...GatewayFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${GATEWAY_FRAGMENT}
`

const GatewayIndexWithData = graphql(query, queryOptions)(GatewayIndex)

export default connect(mapStateToProps, mapDispatchToProps)(GatewayIndexWithData);
