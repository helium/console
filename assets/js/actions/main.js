import { fetchUser } from './user'

export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchUser())
  }
}
