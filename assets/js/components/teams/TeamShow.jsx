import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchTeam } from '../../actions/team'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'

// MUI
import Typography from 'material-ui/Typography';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class TeamShow extends Component {
  componentDidMount() {
    const { fetchTeam, currentTeamId } = this.props
    fetchTeam(currentTeamId)
  }

  render() {
    const { memberships } = this.props

    return (
      <DashboardLayout title="Team Access">
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Team Access
            </Typography>
            <MembersTable members={memberships} />
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const currentTeamId = state.auth.currentTeamId
  const team = state.entities.teams[currentTeamId]
  let memberships = []
  if (team !== undefined && team.memberships !== undefined) {
    memberships = Object.values(state.entities.memberships, team.memberships)
  }

  return {
    currentTeamId,
    memberships
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchTeam }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamShow);
