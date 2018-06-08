import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { deleteMembership } from '../../actions/membership'
import moment from 'moment'
import random from 'lodash/random'
import userCan from '../../util/abilities'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_MEMBERSHIPS, MEMBERSHIP_SUBSCRIPTION } from '../../graphql/memberships'

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import SmallChip from '../common/SmallChip'

@connect(null, mapDispatchToProps)
class MembersTable extends Component {
  render() {
    const {
       deleteMembership, openEditMembershipModal
    } = this.props

    const columns = [
      {
        Header: 'User',
        accessor: 'email',
        Cell: props => <span>{props.row.email}</span>
      },
      {
        Header: 'Role',
        accessor: 'role',
        Cell: props => <Role role={props.row.role} />
      },
      {
        Header: 'Joined',
        accessor: 'inserted_at',
        Cell: props => <span>{moment(props.row.inserted_at).format('LL')}</span>
      },
      {
        Header: 'Last Login',
        Cell: props => <span>{moment([2018, random(0, 4), random(1, 28)]).fromNow()}</span>
      },
      {
        Header: 'Two Factor',
        Cell: props => <SmallChip label="Enabled" />
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          {userCan('update', 'membership', props.row) &&
            <Button
              onClick={() => openEditMembershipModal(props.row)}
              size="small"
            >
              Edit
            </Button>
          }

          {userCan('delete', 'membership', props.row) &&
            <Button
              color="secondary"
              onClick={() => deleteMembership(props.row)}
              size="small"
            >
              Remove
            </Button>
          }
        </span>
      },
    ]

    return (
      <PaginatedTable
        columns={columns}
        query={PAGINATED_MEMBERSHIPS}
        subscription={MEMBERSHIP_SUBSCRIPTION}
        EmptyComponent={ props => <BlankSlate title="Loading..." /> }
      />
    )
  }
}

const Role = (props) => {
  switch(props.role) {
    case 'admin':
      return <span>Administrator</span>
    case 'developer':
      return <span>Developer</span>
    case 'analyst':
      return <span>Analyst</span>
    case 'viewer':
      return <span>View Only</span>
    default:
      return <span>{props.role}</span>
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    deleteMembership
  }, dispatch);
}

export default MembersTable
