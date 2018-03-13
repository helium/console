import React from 'react';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createHistory from 'history/createBrowserHistory';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import reducers from '../reducers';

// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory();

// Build the middleware for intercepting and dispatching navigation actions
// TODO: if ENV is dev, use logger, else do not use
const middleware = [logger, routerMiddleware(history), thunk];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const composedEnhancers = composeEnhancers(applyMiddleware(...middleware));

const rootReducer = combineReducers({
  ...reducers,
  router: routerReducer
});

const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['errors']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer, composedEnhancers);
export const persistor = persistStore(store);

// export default () => {
//   return { store, persistor, history };
// }
