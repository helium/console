import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { formatDatetime } from '../../util/time'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connect } from 'react-redux';

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
  constructor(props) {
    super(props)

    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)

    this.state = {
      page: 1,
      pageSize: 5
    }
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
    if (this.props.data.loading) {
      return (
        <Paper style={{textAlign: 'center', padding: '5em'}}>
          <Typography variant="display1" style={{color: "#e0e0e0"}}>
            Loading...
          </Typography>
        </Paper>
      )
    }
    const { auditTrails } = this.props.data
    const { page, pageSize } = this.state

    return (
      <CardContent>
        <Typography variant="headline" component="h3">
          {this.props.title}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Object</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditTrails.entries.map(action => (
              <TableRow key={action.id}>
                <TableCell>{action.userEmail}</TableCell>
                <TableCell>{action.object}</TableCell>
                <TableCell>{action.action}</TableCell>
                <TableCell>{action.description}</TableCell>
                <TableCell>{formatDatetime(action.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooterPagination
            totalEntries={auditTrails.totalEntries}
            page={page}
            pageSize={pageSize}
            handleChangePage={this.handleChangePage}
            handleChangeRowsPerPage={this.handleChangeRowsPerPage}
          />
        </Table>
      </CardContent>
    )
  }
}

const query = gql`
  query AuditTrailsQuery ($userId: ID, $page: Int, $pageSize: Int) {
    auditTrails (userId: $userId, page: $page, pageSize: $pageSize) {
      entries {
        id
        userEmail
        object
        action
        description
        updatedAt
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

const queryOptions = {
  options: props => {
    const variables = {
      page: 1,
      pageSize: 5,
      userId: props.userId
    }
    return {
      fetchPolicy: 'network-only',
      variables
    }
  }
}

const AuditWithData = graphql(query, queryOptions)(AuditTable)
export default AuditWithData
