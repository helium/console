import React, { Component } from 'react'
import Navbar from './Navbar'

class DashboardLayout extends Component {
  render() {
    return (
      <div>
        <Navbar current={this.props.current} />
        <h2>{this.props.title}</h2>
        {this.props.children}
      </div>
    )
  }
}

export default DashboardLayout
