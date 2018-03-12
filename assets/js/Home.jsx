import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return(
    <div>
      <h1>Home!</h1>
      <Link to="/login">Log in</Link>
      <Link to="/register">Register</Link>
    </div>
  )
};

export default Home;
