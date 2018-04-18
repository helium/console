import { fetchDevices } from './device'
import { fetchGateways } from './gateway'
import { fetchChannels } from './channel'
import { fetchTeams } from './team'
import { fetchMemberships } from './membership'
import { fetchInvitations } from './invitation'

export const DELETED_ENTITY = "DELETED_ENTITY"


export const fetchIndices = () => {
  return (dispatch) => {
    dispatch(fetchDevices())
    dispatch(fetchGateways())
    dispatch(fetchChannels())
    dispatch(fetchTeams())
    dispatch(fetchMemberships())
    dispatch(fetchInvitations())
  }
}
