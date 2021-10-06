import React, { useState, useEffect } from 'react';
import {
  Switch,
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { Spin } from "antd";
import { checkUser } from './actions/magic';
import { UserContext } from './context/magicUserContext'
import MagicAuthenticate from './components/auth/MagicAuthenticate';
import AuthLayout from './components/common/AuthLayout';
import MagicRouter from './MagicRouter'

const MagicApp = () => {
  const [user, setUser] = useState({ isLoggedIn: null, email: '', sub: '' });
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
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <Spin size="large" />
      </div>
    );
  }
  return (
    <UserContext.Provider value={user}>
      <Router>
        {!user.isLoggedIn && (
          <React.Fragment>
            <Switch>
              <Route path="/" component={MagicAuthenticate} />
            </Switch>
          </React.Fragment>
        )}
        {user.isLoggedIn && (
          <MagicRouter user={user} />
        )}
      </Router>
    </UserContext.Provider>
  );
};
export default MagicApp;
