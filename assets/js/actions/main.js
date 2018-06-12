import { fetchTeams } from './team'
import { fetchMemberships } from './membership'

export const DELETED_ENTITY = "DELETED_ENTITY"


export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchTeams())
    dispatch(fetchMemberships())
  }
}
