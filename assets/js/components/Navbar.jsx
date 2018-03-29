import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';

class Navbar extends Component {
  render() {
    const { current, email } = this.props

    return (
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <Link to="/" className="navbar-brand">Helium:Console</Link>
          </div>

          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li className={current === "devices" ? "active" : ""}>
                <Link to="/devices">Devices</Link>
              </li>
              <li className={current === "gateways" ? "active" : ""}>
                <Link to="/gateways">Gateways</Link>
              </li>
              <li className={current === "channels" ? "active" : ""}>
                <Link to="/channels">Channels</Link>
              </li>
            </ul>

            <ul className="nav navbar-nav navbar-right">
              <li>
                <Link to="/secret">{email}</Link>
              </li>
            </ul>
          </div>


        </div>
      </nav>
    )
  }
}

function mapStateToProps(state) {
  return {
    email: state.user.email
  }
}

export default connect(mapStateToProps)(Navbar);
