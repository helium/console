import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { logoutUser } from '../../actions/magic';
import { UserContext } from '../../context/magicUserContext'

const Dashboard = () => {
  const { email } = useContext(UserContext);
  const history = useHistory();
  const handleLogOut = async () => {
    try {
      await logoutUser();
      history.replace('/');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <div>
        <Button onClick={handleLogOut}>
          Sign Out
        </Button>
      </div>
      <h1>User: {email}</h1>
    </div>
  );
};
export default Dashboard;
