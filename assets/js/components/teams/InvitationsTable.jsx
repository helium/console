import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import UserCan from '../common/UserCan'
import { deleteInvitation } from '../../actions/invitation'
import PaginatedTable from '../common/PaginatedTable'
import BlankSlate from '../common/BlankSlate'
import { PAGINATED_INVITATIONS, INVITATION_SUBSCRIPTION } from '../../graphql/invitations'

// MUI
import Button from '@material-ui/core/Button';

@connect(null, mapDispatchToProps)
class InvitationsTable extends Component {
  render() {
    const { deleteInvitation } = this.props

    const columns = [
      {
        Header: 'User',
        accessor: 'email'
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
          <UserCan action="delete" itemType="membership" item={props.row}>
            <Button
              onClick={() => {
                console.log("ACTION_DELETE_INVITATION", props.row.email)
                deleteInvitation(props.row)
              }}
              color="secondary"
              size="small"
              >
              Remove
            </Button>
          </UserCan>
        </span>
      },
    ]

    return (
      <PaginatedTable
        columns={columns}
        query={PAGINATED_INVITATIONS}
        subscription={INVITATION_SUBSCRIPTION}
        EmptyComponent={ props => <BlankSlate title="No Pending Invitations" noIcon={true} /> }
      />
    )
  }
}

const Role = (props) => {
  switch(props.role) {
    case 'admin':
      return <span>Administrator</span>
    case 'manager':
      return <span>Manager</span>
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
