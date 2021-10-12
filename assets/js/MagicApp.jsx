import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
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

const MagicApp = ({ user }) => {
  const [loading, setLoading] = useState();
  useEffect(() => {
    const validateUser = async () => {
      setLoading(true);
      try {
        await checkUser();
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    validateUser();
  }, []);

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

function mapStateToProps(state, ownProps) {
  return {
    user: state.magicUser
  };
}

export default connect(mapStateToProps, null)(MagicApp);
