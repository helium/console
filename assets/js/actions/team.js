import * as rest from '../util/rest';
import { normalizeTeam } from '../schemas/team'

export const RECEIVED_TEAM = 'RECEIVED_TEAM'

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
