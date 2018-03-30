import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTeams } from '../../actions/team'
import DashboardLayout from '../DashboardLayout'

class TeamIndex extends Component {
  componentDidMount() {
    this.props.fetchTeams()
  }

  render() {
    const { teams } = this.props

    return(
      <DashboardLayout title="Teams">
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
    teams: Object.values(state.entities.teams)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchTeams }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamIndex);
