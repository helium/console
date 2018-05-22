import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Typography from 'material-ui/Typography';
import Card, { CardContent } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow, TableFooter, TablePagination } from 'material-ui/Table';

// Icons
import DashboardIcon from 'material-ui-icons/Dashboard';

class Audit extends Component {
  render() {
    if (this.props.data.loading) {
      return (
        <DashboardLayout title="Audit Trails">
          <Paper style={{textAlign: 'center', padding: '5em'}}>
            <Typography variant="display1" style={{color: "#e0e0e0"}}>
              Loading...
            </Typography>
          </Paper>
        </DashboardLayout>
      )
    }
    return (
      <DashboardLayout title="Audit Trails">
        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Object</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Datetime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.data.auditTrails.map(action => (
                  <TableRow key={action.id}>
                    <TableCell>{action.userEmail}</TableCell>
                    <TableCell>{action.object}</TableCell>
                    <TableCell>{action.action}</TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell>{action.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

const query = gql`
  query AuditTrailsQuery {
    auditTrails {
      id
      userEmail
      object
      action
      description
      updatedAt
    }
  }
`

const queryOptions = {
  options: props => ({
    fetchPolicy: 'network-only'
  })
}

const AuditWithData = graphql(query, queryOptions)(Audit)
export default AuditWithData
