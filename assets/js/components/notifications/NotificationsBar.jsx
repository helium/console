import React, { Component } from 'react'
import NotificationsMenu from './NotificationsMenu'
import { PAGINATED_NOTIFICATIONS, NOTIFICATION_SUBSCRIPTION } from '../../graphql/notifications'
import { graphql } from 'react-apollo';

// MUI
import IconButton from '@material-ui/core/IconButton'
import SmallBadge from '../common/SmallBadge'

// Icons
import NotificationsIcon from '@material-ui/icons/Notifications'

const queryOptions = {
  options: props => ({
    variables: {
      active: true,
      page: 1,
      pageSize: 5
    },
    fetchPolicy: 'network-only',
  })
}

// @graphql(PAGINATED_NOTIFICATIONS, {active: true, page: 1, pageSize: 5})
@graphql(PAGINATED_NOTIFICATIONS, queryOptions)
class NotificationsBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data

    subscribeToMore({
      document: NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          variables: {active: true, page: 1, pageSize: 5},
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  handleClose() {
    this.setState({
      anchorEl: null
    })
  }

  handleClick(e) {
    this.setState({
      anchorEl: e.currentTarget
    })
  }

  render() {
    const { anchorEl } = this.state
    const { loading, notifications } = this.props.data

    if (loading) return <IconButton color="inherit"><NotificationsIcon /></IconButton>
    const { totalEntries, entries } = notifications

    return (
      <div>
        <IconButton onClick={this.handleClick} color="inherit">
          {totalEntries > 0 ?
            <SmallBadge badgeContent={totalEntries} color="secondary">
              <NotificationsIcon />
            </SmallBadge>
            :
            <NotificationsIcon />
          }
        </IconButton>

        <NotificationsMenu
          notifications={entries}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        />
      </div>
    )
  }
}

export default NotificationsBar
