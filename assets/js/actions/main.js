import { fetchTeams } from './team'

export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchTeams())
  }
}
