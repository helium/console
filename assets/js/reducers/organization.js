import { FETCHED_ORGANIZATION, FETCHING_ORGANIZATION } from '../actions/organization'

const initialState = {
    currentOrganizationId: null
}

const organization = (state = initialState, action) => {
    switch(action.type) {
      case FETCHED_ORGANIZATION:
        return { 
            ...state, 
            currentOrganizationId: action.currentOrganizationId, 
            currentOrganizationName: action.currentOrganizationName,
            currentRole: action.currentRole,
            loadedOrganization: true
        };
      case FETCHING_ORGANIZATION:
        return {
          ...state,
          loadedOrganization: false
        }
      default:
        return state;
    }
}

export default organization;