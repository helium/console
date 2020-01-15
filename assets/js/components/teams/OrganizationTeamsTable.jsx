import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import filter from 'lodash/filter'
import { switchTeam, deleteTeam } from '../../actions/team'
import UserCan from '../common/UserCan'
import { CURRENT_ORGANIZATION_TEAMS, TEAM_SUBSCRIPTION } from '../../graphql/organizations'
import analyticsLogger from '../../util/analyticsLogger'
import { Table, Typography, Button, Empty } from 'antd';
const { Text } = Typography
import { Query } from 'react-apollo';

@connect(mapStateToProps, mapDispatchToProps)
class OrganizationTeamsTable extends Component {
  render() {
    const { switchTeam, currentTeamId, currentOrganizationId, deleteTeam } = this.props
    const columns = [
      {
        title: 'Team',
        dataIndex: 'name',
      },
      {
        title: 'Created',
        dataIndex: 'inserted_at',
        render: data => moment(data).format('LL')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          currentTeamId !== record.id ? (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
              icon="swap"
                type="primary"
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_SWITCH_TEAM", {"id": record.id })
                  switchTeam(record.id)
                }}
              >
                Switch
              </Button>
               <UserCan action="delete" itemType="team" item={record}>
                <Button
                icon="delete"
                  type="danger"
                  onClick={() => {
                    analyticsLogger.logEvent("ACTION_DELETE_TEAM", {"id": record.id})
                    deleteTeam(record.id)
                  }}
                >
                  Delete
                </Button>
              </UserCan>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text>Current</Text>
            </div>
          )
        ),
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
    const { loading, error, data, columns, openTeamModal } = this.props

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const { organization } = data
    const teams = filter(data.organization.teams, d => d !== undefined).map(r => { r.key = r.id; return r })

    if (teams.length === 0) return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span>No Teams</span>}
      />
    )

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Button
          icon="plus"
            onClick={() => {
              analyticsLogger.logEvent("ACTION_NEW_TEAM")
              openTeamModal(organization.id, organization.name)
            }}
            type="primary"

          >
            Create New Team
          </Button>
        </div>
        <Table columns={columns} dataSource={teams} pagination={false} />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentTeamId: state.auth.currentTeamId,
    currentOrganizationId: state.auth.currentOrganizationId,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ switchTeam, deleteTeam }, dispatch);
}

export default OrganizationTeamsTable
