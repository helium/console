import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../common/DashboardLayout'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_NOTIFICATIONS, NOTIFICATION_SUBSCRIPTION } from '../../graphql/notifications'
import { formatDatetimeAgo } from '../../util/time'
import BlankSlate from '../common/BlankSlate'

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import  { markRead, clearAll } from '../../actions/notifications'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles'

// Icons
import NotificationsIcon from '@material-ui/icons/Notifications';
import ActiveIcon from '@material-ui/icons/FiberManualRecord';
import ConsoleIcon from '../common/ConsoleIcon'

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
})

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ markRead, clearAll }, dispatch);
}

@withStyles(styles)
@connect(null, mapDispatchToProps)
class Notifications extends Component {
  constructor(props) {
    super(props)
    this.markRead = this.markRead.bind(this)
  }

  markRead(notification, followUrl = true) {
    const { markRead } = this.props
    if (followUrl) {
      markRead(notification.id, notification.url)
    } else {
      markRead(notification.id)
    }
  }

  render() {
    const { classes, clearAll } = this.props

    const columns = [
      {
        Header: '',
        accessor: 'active',
        padding: 'checkbox',
        Cell: props => props.value ?  <ActiveIcon style={{fontSize: "14px", color: "#f50057"}} /> : null
      },
      {
        Header: '',
        accessor: 'active',
        padding: 'checkbox',
        Cell: props => <ConsoleIcon category={props.row.category} />
      },
      {
        Header: 'Message',
        Cell: props => <a onClick={() => this.markRead(props.row)} href="javascript:void(0)" style={{fontWeight: props.row.active ? 500 : 300}}>
          {props.row.title}: {props.row.body}
          </a>
      },
      {
        Header: 'Time',
        accessor: 'insertedAt',
        Cell: props => <span style={{fontWeight: props.row.active ? 500 : 300}}>{formatDatetimeAgo(props.value)}</span>
      },
      {
        Header: 'Seen by',
        Cell: props => <span style={{fontWeight: props.row.active ? 500 : 300}}>3 teammates</span>
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          {props.row.active &&
            <Button
              color="secondary"
              onClick={() => this.markRead(props.row, false)}
              size="small"
            >
              Mark as read
            </Button>
          }
        </span>
      },
    ]

    return (
      <DashboardLayout title="All Notifications">
        <Paper className={classes.paper}>
          <header className={classes.header}>
            <Typography variant="headline" component="h3">
              Notifications
            </Typography>

            <Button onClick={clearAll}>
              Mark all as read
            </Button>
          </header>

          <PaginatedTable
            columns={columns}
            query={PAGINATED_NOTIFICATIONS}
            subscription={NOTIFICATION_SUBSCRIPTION}
            fetchPolicy="network-only"
            EmptyComponent={ props => <BlankSlate title="No notifications" subheading="You don't currently have any active or past notifications" /> }
          />

        </Paper>
      </DashboardLayout>
    )
  }
}

export default Notifications
