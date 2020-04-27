import { FETCHED_ORGANIZATION } from '../actions/organization'

const initialState = {
    currentOrganizationId: null
}

const organization = (state = initialState, action) => {
    switch(action.type) {
      case FETCHED_ORGANIZATION:
        return { 
            ...state, 
            currentOrganizationId: action.currentOrganizationId, 
            currentOrganizationName: action.currentOrganizationName 
        };
      default:
        return state;
    }
}

export default organization;