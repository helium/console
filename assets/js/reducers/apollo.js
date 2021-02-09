import { CREATED_APOLLO_CLIENT } from '../actions/apollo'

const initialState = {
    apolloClient: null,
    socket: null,
}

const apollo = (state = initialState, action) => {
    switch(action.type) {
      case CREATED_APOLLO_CLIENT:
        return {
            ...state,
            apolloClient: action.apolloClient,
            socket: action.socket
        };
      default:
        return state;
    }
}

export default apollo;
