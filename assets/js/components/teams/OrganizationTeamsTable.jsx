import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import random from 'lodash/random'
import find from 'lodash/find'
import get from 'lodash/get'
import merge from 'lodash/merge'
import { switchTeam, deleteTeam } from '../../actions/team'
import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import BlankSlate from '../common/BlankSlate'
import { CURRENT_ORGANIZATION_TEAMS, TEAM_SUBSCRIPTION } from '../../graphql/organizations'

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
import SmallChip from '../common/SmallChip'
import SuccessChip from '../common/SuccessChip'

@connect(mapStateToProps, mapDispatchToProps)
class OrganizationTeamsTable extends Component {
  render() {
    const { switchTeam, currentTeamId, currentOrganizationId, deleteTeam } = this.props
    const columns = [
      {
        Header: 'Team',
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
            currentTeamId !== props.row.id && (
              <span>
                <Button
                  color="primary"
                  onClick={() => {
                    console.log("ACTION_SWITCH_TEAM", props.row.id)
                    switchTeam(props.row.id)
                  }}
                  size="small"
                >
                  VIEW
                </Button>
                <UserCan action="delete" itemType="team" item={props.row}>
                  <Button
                    color="secondary"
                    onClick={() => {
                      console.log("ACTION_DELETE_TEAM", props.row.id)
                      deleteTeam(props.row.id)
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
      <Query query={CURRENT_ORGANIZATION_TEAMS} fetchPolicy={'cache-and-network'} variables={{ Id: currentOrganizationId }}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            variables={variables}
            EmptyComponent={ props => <BlankSlate title="Loading..." /> }
            subscription={TEAM_SUBSCRIPTION}
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
    const { loading, error, data, EmptyComponent, columns, openTeamModal } = this.props

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
        openTeamModal={openTeamModal}
        {... this.props}
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
  const { columns, results: organization, currentOrganizationName } = props

  return (
    <div>
      <header style={styles.header}>
        <Typography variant="headline" component="h3">
          Teams in {currentOrganizationName}
        </Typography>

        <UserCan action="create" itemType="team">
          <Button
            color="primary"
            onClick={() => {
              console.log("ACTION_NEW_TEAM")
              props.openTeamModal(organization.id, organization.name)
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
          {organization.teams.map(t =>
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
    currentTeamId: state.auth.currentTeamId,
    currentOrganizationId: state.auth.currentOrganizationId,
    currentOrganizationName: state.auth.currentOrganizationName
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ switchTeam, deleteTeam }, dispatch);
}

export default OrganizationTeamsTable
