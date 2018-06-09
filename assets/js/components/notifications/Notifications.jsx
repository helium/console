import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../common/DashboardLayout'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_NOTIFICATIONS } from '../../graphql/notifications'
import { formatDatetimeAgo } from '../../util/time'
import BlankSlate from '../common/BlankSlate'

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

@withStyles(styles)
class Notifications extends Component {
  render() {
    const { classes } = this.props

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
        Cell: props => <Link to={props.row.url} style={{fontWeight: props.row.active ? 500 : 300}}>
          {props.row.title}: {props.row.body}
          </Link>
      },
      {
        Header: 'Time',
        accessor: 'insertedAt',
        Cell: props => <span style={{fontWeight: props.row.active ? 500 : 300}}>{formatDatetimeAgo(props.value)}</span>
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          <Button
            component={Link}
            to={props.row.url}
            size="small"
          >
            View
          </Button>
          <Button
            color="secondary"
            component={Link}
            to={`/notifications/${props.row.id}`}
            size="small"
          >
            Mark as read
          </Button>
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

            <Button>
              Mark all as read
            </Button>
          </header>

          <PaginatedTable
            columns={columns}
            query={PAGINATED_NOTIFICATIONS}
            EmptyComponent={ props => <BlankSlate title="No notifications" subheading="You don't currently have any active or past notifications" /> }
          />

        </Paper>
      </DashboardLayout>
    )
  }
}

export default Notifications
