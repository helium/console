import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTeams } from '../../actions/team'
import DashboardLayout from '../DashboardLayout'

const CurrentTeam = (props) => {
  if (props.team !== undefined) {
    return (
      <div>
        <strong>Current Team:</strong> {props.team.name}
      </div>
    )
  } else {
    return (
      <div>
        <p>Loading current team...</p>
      </div>
    )
  }
}

class TeamIndex extends Component {
  componentDidMount() {
    this.props.fetchTeams()
  }

  render() {
    const { teams, currentTeam } = this.props

    return(
      <DashboardLayout title="Teams">
        <CurrentTeam team={currentTeam} />
        {teams.length > 0 ? (
          <ul>
            {teams.map(team => <li key={team.id}>
              <Link to={`/teams/${team.id}`}>{team.name}</Link>
            </li>)}
          </ul>
        ) : (
          <p>No teams</p>
        )}
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    teams: Object.values(state.entities.teams),
    currentTeam: state.entities.teams[state.auth.currentTeamId]
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchTeams }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamIndex);
