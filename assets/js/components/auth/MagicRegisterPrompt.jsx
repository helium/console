import React from 'react';
import { useSelector } from "react-redux";
import { Button, Typography, Card } from 'antd';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import { useDispatch } from "react-redux";
import { logOut } from '../../actions/auth'
const { Text, Title } = Typography

const MagicRegisterPrompt = () => {
  const dispatch = useDispatch();
  const mainLogo = useSelector((state) => state.appConfig.mainLogo);
  const appName =
    process.env.SELF_HOSTED ? useSelector((state) => state.appConfig.appName) : "Helium Dedicated Console"

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(logOut())
  };

  return (
    <AuthLayout>
      <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
        <img src={mainLogo || Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
        <div style={{textAlign: 'center', marginBottom: 30}}>
          <Title>
            {appName}
          </Title>
          <Text>{appName} is by invite only. Please contact {process.env.SELF_HOSTED ? "the admin" : "our sales team"} to complete your registration.</Text>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%' }}
          onClick={handleSubmit}
        >
          Log Out
        </Button>
      </Card>
    </AuthLayout>
  )
};

export default MagicRegisterPrompt;
