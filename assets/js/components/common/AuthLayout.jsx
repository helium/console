import React, { Component } from 'react'

const styles = {
  root: {
    height: '100vh',
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  main: {
    maxWidth: 400,
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
