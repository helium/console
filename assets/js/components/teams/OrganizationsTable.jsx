import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import find from 'lodash/find'
import { switchOrganization, deleteOrganization } from '../../actions/team'
import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import BlankSlate from '../common/BlankSlate'
import { ALL_ORGANIZATIONS, ORGANIZATION_SUBSCRIPTION } from '../../graphql/organizations'
import analyticsLogger from '../../util/analyticsLogger'

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
    const { currentOrganizationId, switchOrganization, userId, deleteOrganization } = this.props
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
              <span>
                <Button
                  color="primary"
                  onClick={() => {
                    analyticsLogger.logEvent("ACTION_SWITCH_ORG", {"id": props.row.id })
                    switchOrganization(props.row.id)
                  }}
                  size="small"
                >
                  VIEW
                </Button>
                <UserCan action="delete" itemType="organization" item={props.row}>
                  <Button
                    color="secondary"
                    onClick={() => {
                      analyticsLogger.logEvent("ACTION_DELETE_ORG", {"id": props.row.id })
                      deleteOrganization(props.row.id)
                    }}
                    size="small"
                  >
                    Delete
                  </Button>
                </UserCan>
              </span>
            )
          }
        </span>
      },
    ]

    return (
      <Query query={ALL_ORGANIZATIONS} fetchPolicy={'cache-and-network'} variables={{ userId: userId }}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            subscription={ORGANIZATION_SUBSCRIPTION}
            variables={variables}
            EmptyComponent={ props => <BlankSlate title="Loading..." /> }
            {...this.props}
          />
        )}
      </Query>
    )
  }
}


class QueryResults extends Component {
  componentDidMount() {
    const { subscribeToMore, subscription, fetchMore, variables } = this.props

    subscription && subscribeToMore({
      document: subscription,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  render() {
    const { loading, error, data, EmptyComponent, columns, openOrganizationModal } = this.props

    if (loading) return null;
    if (error) return (
      <Typography variant="subheading">Data failed to load, please reload the page and try again</Typography>
    )

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
          Organizations
        </Typography>

        <UserCan action="create" itemType="organization">
          <Button
            color="primary"
            onClick={() => {
              analyticsLogger.logEvent("ACTION_NEW_ORG")
              props.openOrganizationModal()
            }}
          >
            + New
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
    userId: state.auth.user.id,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ switchOrganization, deleteOrganization }, dispatch);
}

export default OrganizationsTable
