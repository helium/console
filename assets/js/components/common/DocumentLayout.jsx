import React, { Component } from 'react'

const styles = {
  root: {
    height: '100vh',
    zIndex: 1,
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
}

class DocumentLayout extends Component {
  render() {
    return (
      <div style={styles.root}>
        <main>
          {this.props.children}
        </main>
      </div>
    )
  }
}

export default DocumentLayout
