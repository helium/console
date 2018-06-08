import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import moment from 'moment'
import userCan from '../../util/abilities'
import { deleteInvitation } from '../../actions/invitation'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_INVITATIONS, INVITATION_SUBSCRIPTION } from '../../graphql/invitations'

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

@connect(null, mapDispatchToProps)
class InvitationsTable extends Component {
  render() {
    const { deleteInvitation } = this.props

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
        Header: 'Sent At',
        accessor: 'inserted_at',
        Cell: props => <span>{moment(props.row.inserted_at).format('LL')}</span>
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          {userCan('delete', 'membership', props.row) &&
            <Button
              onClick={() => deleteInvitation(props.row)}
              color="secondary"
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
        query={PAGINATED_INVITATIONS}
        subscription={INVITATION_SUBSCRIPTION}
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
    deleteInvitation
  }, dispatch);
}

export default InvitationsTable
