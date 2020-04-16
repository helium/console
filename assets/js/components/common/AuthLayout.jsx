import React, { Component } from 'react';

const styles = {
  root: {
    height: '100vh',
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    background: '#F0F2F5',
    justifyContent: 'center',
    backgroundImage: `url(${bg})`,
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
  main: {
    maxWidth: 500,
    position: 'absolute',
    top: '47%',
    left: '50%',
    transform: 'translate(-50% , -50%)',
    height: 'auto',

  },
}

class AuthLayout extends Component {
  render() {
    return (
      <div style={styles.root}>
        <main style={styles.main}>
          {this.props.children}
        </main>
      </div>
    )
  }
}

export default AuthLayout
