import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteChannel } from '../../actions/channel'
import RandomChannelButton from './RandomChannelButton'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import BlankSlate from '../common/BlankSlate'
import userCan from '../../util/abilities'
import ChannelCreateRow from './ChannelCreateRow'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

//MUI
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

class ChannelIndex extends Component {
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
    const { deleteChannel } = this.props
    const { loading, channels } = this.props.data

    if (loading) return <DashboardLayout title={"All Channels"} />

    return(
      <DashboardLayout title="All Channels">
        {userCan('create', 'channel') &&
          <Card>
            <CardContent>
              <Typography variant="headline" component="h3">
                Create New Channel
              </Typography>

              <ChannelCreateRow />
            </CardContent>
          </Card>
        }

        <Paper style={{marginTop: 24}}>
          {channels.length === 0 ? (
            <BlankSlate
              title="No channels"
              subheading="To create a new channel, click the red button in the corner"
            />
          ) : (
            <ChannelsTable
              channels={channels.entries}
              deleteChannel={deleteChannel}
              totalEntries={channels.totalEntries}
              page={this.state.page}
              pageSize={this.state.pageSize}
              handleChangePage={this.handleChangePage}
              handleChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          ) }
        </Paper>

        {userCan('create', 'channel') &&
          <RandomChannelButton />
        }
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteChannel }, dispatch);
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
  query PaginatedChannelsQuery ($page: Int, $pageSize: Int) {
    channels(page: $page, pageSize: $pageSize) {
      entries {
        name,
        type,
        id
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

const ChannelIndexWithData = graphql(query, queryOptions)(ChannelIndex)

export default connect(mapStateToProps, mapDispatchToProps)(ChannelIndexWithData);
