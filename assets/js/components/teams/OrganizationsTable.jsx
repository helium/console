import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import find from 'lodash/find'
import { switchOrganization } from '../../actions/team'
import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import BlankSlate from '../common/BlankSlate'
import { ALL_ORGANIZATIONS } from '../../graphql/organizations'

// GraphQL
import { Query } from 'react-apollo';

// MUI
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

@connect(mapStateToProps, mapDispatchToProps)
class OrganizationsTable extends Component {
  render() {
    const { currentOrganizationId, switchOrganization } = this.props
    const columns = [
      {
        Header: 'Organization',
        accessor: 'name'
      },
      {
        Header: 'Created',
        accessor: 'inserted_at',
        Cell: props => <span>{moment(props.row.inserted_at).format('LL')}</span>
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          {
            currentOrganizationId !== props.row.id && (
              <Button
                color="primary"
                onClick={() => switchOrganization(props.row.id)}
                size="small"
              >
                VIEW
              </Button>
            )
          }
        </span>
      },
    ]

    return (
      <Query query={ALL_ORGANIZATIONS} fetchPolicy={'cache-and-network'}>
        {({ loading, error, data }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            EmptyComponent={ props => <BlankSlate title="Loading..." /> }
            {...this.props}
          />
        )}
      </Query>
    )
  }
}


class QueryResults extends Component {
  render() {
    const { loading, error, data, EmptyComponent, columns, openOrganizationModal } = this.props

    if (loading) return null;
    if (error) return `Error!: ${error}`;

    const results = find(data, d => d !== undefined)

    if (results.length === 0 && EmptyComponent) return (
      <EmptyComponent />
    )

    return (
      <ResultsTable
        results={results}
        columns={columns}
        openTeamModal={openOrganizationModal}
        {...this.props}
      />
    )
  }
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}

const ResultsTable = (props) => {
  const { columns, results: organizations } = props

  return (
    <div>
      <header style={styles.header}>
        <Typography variant="headline" component="h3">
          All Organizations
        </Typography>

        <UserCan action="create">
          <Button
            color="primary"
            onClick={props.openOrganizationModal}
          >
            New Organization
          </Button>
        </UserCan>
      </header>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, i) =>
              <TableCell
                key={`header-${i}`}
                numeric={column.numeric}
                padding={column.padding}
              >
                {column.Header}
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {organizations.map(t =>
            <PaginatedRow key={t.id} row={t} columns={columns} />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

const PaginatedRow = (props) => {
  const { row, columns } = props
  return (
    <TableRow>
      {columns.map((column, i) =>
        <PaginatedCell key={`${row.id}-${i}`} row={row} column={column} />
      )}
    </TableRow>
  )
}

const PaginatedCell = (props) => {
  const { row, column } = props
  const { Cell } = column
  const value = row[column.accessor]

  if (Cell) return (
    <TableCell numeric={column.numeric} padding={column.padding}>
      <Cell row={row} value={value} />
    </TableCell>
  )

  return (
    <TableCell numeric={column.numeric} padding={column.padding}>
      {value}
    </TableCell>
  )
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.auth.currentOrganizationId,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ switchOrganization }, dispatch);
}

export default OrganizationsTable
