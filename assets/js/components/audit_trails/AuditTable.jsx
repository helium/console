import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { formatDatetime } from '../../util/time'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_AUDIT_TRAILS } from '../../graphql/auditTrails'
import { PAGINATED_INVITATIONS, INVITATION_SUBSCRIPTION } from '../../graphql/invitations'

// MUI
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooterPagination from '../common/TableFooterPagination'

// Icons
import DashboardIcon from '@material-ui/icons/Dashboard';

class AuditTable extends Component {
  render() {
    const { userId } = this.props

    const columns = [
      {
        Header: 'User',
        accessor: 'userEmail',
        Cell: props => <span>{props.row.userEmail}</span>
      },
      {
        Header: 'Object',
        accessor: 'object',
        Cell: props => <span>{props.row.object}</span>
      },
      {
        Header: 'Action',
        accessor: 'action',
        Cell: props => <span>{props.row.action}</span>
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: props => <span>{props.row.description}</span>
      },
      {
        Header: 'Time',
        accessor: 'updatedAt',
        Cell: props => <span>{formatDatetime(props.row.updatedAt)}</span>
      },
    ]

    return (
      <PaginatedTable
        columns={columns}
        query={PAGINATED_AUDIT_TRAILS}
        EmptyComponent={ props => <BlankSlate title="Loading..." /> }
        variables={{ pageSize: 25, userId }}
        fetchPolicy="network-only"
      />
    )
  }
}

export default AuditTable
