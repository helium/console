import * as rest from '../util/rest';
import { normalizeTeam, normalizeTeams } from '../schemas/team'

export const FETCH_TEAMS = 'FETCH_TEAMS'
export const RECEIVED_TEAMS = 'RECEIVED_TEAMS'
export const FETCH_TEAM = 'FETCH_TEAM'
export const RECEIVED_TEAM = 'RECEIVED_TEAM'

export const fetchTeams = () => {
  return (dispatch) => {
    rest.get('/api/teams')
      .then(response => {
        return dispatch(receivedTeams(response.data))
      })
  }
}

export const receivedTeams = (teams) => {
  const entities = normalizeTeams(teams)

  return {
    type: RECEIVED_TEAMS,
    entities
  }
}

export const createTeam = (name) => {
  return (dispatch) => {
    rest.post('/api/teams', {
        team: {
          name
        }
      })
      .then(response => {
        return dispatch(receivedTeam(response.data))
      })
  }
}

export const receivedTeam = (team) => {
  const entities = normalizeTeam(team)

  return {
    type: RECEIVED_TEAM,
    entities
  }
}
