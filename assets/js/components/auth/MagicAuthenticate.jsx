import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Typography, Input } from 'antd';
import { loginUser } from '../../actions/magic';

const MagicAuthenticate = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);
  const history = useHistory();

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
      setLoading(false);
      history.replace('/dashboard');
    } catch (error) {
      setError('Unable to log in');
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <div>
      <h1>Login to Helium Console</h1>
      <Input
        placeholder="Email Address"
        name="email"
        value={email}
        onChange={handleChange}
      />
      <Button
        type="submit"
        onClick={handleSubmit}
      >
        {loading ? 'Loading...' : 'Send'}
      </Button>
    </div>
  );
};
export default MagicAuthenticate;
