import React, { useState, useEffect } from 'react';
import {
  Switch,
  BrowserRouter as Router,
  Route,
  Redirect,
} from 'react-router-dom';
import { checkUser } from './actions/magic';
import { UserContext } from './context/magicUserContext'
import MagicAuthenticate from './components/auth/MagicAuthenticate';
import Dashboard from './components/auth/Dashboard';
import PrivateRoute from './components/routes/PrivateRoute';

const MagicApp = () => {
  const [user, setUser] = useState({ isLoggedIn: null, email: '' });
  const [loading, setLoading] = useState();

  useEffect(() => {
    const validateUser = async () => {
      setLoading(true);
      try {
        await checkUser(setUser);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    validateUser();
  }, [user.isLoggedIn]);
  if (loading) {
    return (
      <div
        style={{ height: '100vh' }}
      >
        Loading...
      </div>
    );
  }
  return (
    <UserContext.Provider value={user}>
      <Router>
        {user.isLoggedIn && <Redirect to={{ pathname: '/dashboard' }} />}
        <Switch>
          <Route exact path="/" component={MagicAuthenticate} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
        </Switch>
      </Router>
    </UserContext.Provider>
  );
};
export default MagicApp;
