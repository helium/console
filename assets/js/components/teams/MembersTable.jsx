import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteMembership } from '../../actions/membership'
import moment from 'moment'
import random from 'lodash/random'
import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import BlankSlate from '../common/BlankSlate'
import { PAGINATED_MEMBERSHIPS, MEMBERSHIP_SUBSCRIPTION } from '../../graphql/memberships'

// MUI
import Button from '@material-ui/core/Button';
import SmallChip from '../common/SmallChip'
import SuccessChip from '../common/SuccessChip'

@connect(null, mapDispatchToProps)
class MembersTable extends Component {
  render() {
    const {
       deleteMembership, openEditMembershipModal
    } = this.props

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
        Header: 'Joined',
        accessor: 'inserted_at',
        Cell: props => <span>{moment(props.row.inserted_at).format('LL')}</span>
      },
      {
        Header: 'Two Factor',
        Cell: props => (props.row.two_factor_enabled ? <SuccessChip label="Enabled"/> : <SmallChip label="Disabled"/>)
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          <UserCan action="update" itemType="membership" item={props.row}>
            <Button
              onClick={() => {
                console.log("ACTION_OPEN_EDIT_MEMBERSHIP", props.row.email)
                openEditMembershipModal(props.row)
              }}
              size="small"
            >
              Edit
            </Button>
          </UserCan>

          <UserCan action="delete" itemType="membership" item={props.row}>
            <Button
              color="secondary"
              onClick={() => {
                console.log("ACTION_DELETE_MEMBERSHIP", props.row.email)
                deleteMembership(props.row)
              }}
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
    case 'manager':
      return <span>Manager</span>
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
