import { fetchTeams } from './team'
import { fetchUser } from './user';

export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchTeams())
    dispatch(fetchUser())
  }
}
