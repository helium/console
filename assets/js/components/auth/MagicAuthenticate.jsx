import React, { useState } from 'react';
import { Button, Card, Typography, Input, Form } from 'antd';
import { loginUser } from '../../actions/magic';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
const { Text, Title } = Typography

const MagicAuthenticate = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!email) {
      setLoading(false);
      setError('Email is Invalid');
      return;
    }
    try {
      await loginUser(email);
      window.location.reload()
      setLoading(false);
    } catch (error) {
      setError('Unable to log in');
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <AuthLayout>
      <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
        <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
        <div style={{textAlign: 'center', marginBottom: 30}}>
          <Title>
            Helium Console
          </Title>
          <Text style={{color:'#38A2FF'}}>Submit your email address to receive a login link</Text>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Item style={{marginBottom: 10}}>
            <Input
              autoFocus
              placeholder="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%' }}
            onClick={handleSubmit}
          >
            {loading ? 'Loading...' : 'Submit'}
          </Button>
        </Form>
      </Card>
    </AuthLayout>
  )
};
export default MagicAuthenticate;
