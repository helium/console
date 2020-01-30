import { fetchUser } from './user'

export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchUser())
    // put more if needed later
  }
}
