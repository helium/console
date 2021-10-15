import React from 'react';
import { Button, Typography, Card } from 'antd';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import { useDispatch } from "react-redux";
import { logOut } from '../../actions/auth'
const { Text, Title } = Typography

const MagicRegisterPrompt = () => {
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(logOut())
  };

  return (
    <AuthLayout>
      <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
        <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
        <div style={{textAlign: 'center', marginBottom: 30}}>
          <Title>
            Helium VIP Console
          </Title>
          <Text>VIP Console is by invite only. Please contact our sales team to complete your registration.</Text>
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
