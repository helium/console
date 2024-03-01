import { Spin } from "antd";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import MagicRouter from "./MagicRouter";
import { checkUser } from "./actions/magic";
import MagicAuthenticate from "./components/auth/MagicAuthenticate";
import MagicRegisterPrompt from "./components/auth/MagicRegisterPrompt";
import { Consoles } from "./components/home/Consoles";
import { UserContext } from "./context/magicUserContext";

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
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
              <Route exact path="/" component={Consoles} />
              <Route exact path="/login" component={MagicAuthenticate} />
            </Switch>
          </React.Fragment>
        )}
        {user.isLoggedIn && user.needRegistration && <MagicRegisterPrompt />}
        {user.isLoggedIn && !user.needRegistration && (
          <MagicRouter user={user} />
        )}
      </Router>
    </UserContext.Provider>
  );
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.magicUser,
  };
}

export default connect(mapStateToProps, null)(MagicApp);
