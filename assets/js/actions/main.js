import { fetchTeams } from './team'

export const DELETED_ENTITY = "DELETED_ENTITY"

export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchTeams())
  }
}
