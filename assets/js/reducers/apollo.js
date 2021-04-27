import { CREATED_APOLLO_CLIENT } from '../actions/apollo'

const initialState = {
    apolloClient: null,
    socket: null,
    tokenClaims: null,
}

const apollo = (state = initialState, action) => {
    switch(action.type) {
      case CREATED_APOLLO_CLIENT:
        return {
            ...state,
            apolloClient: action.apolloClient,
            socket: action.socket,
            tokenClaims: action.tokenClaims
        };
      default:
        return state;
    }
}

export default apollo;
