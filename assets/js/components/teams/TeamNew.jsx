import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DashboardLayout from '../DashboardLayout'
import { createTeam } from '../../actions/team'

class TeamNew extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: ""
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name } = this.state;

    this.props.createTeam(name);
  }

  render() {
    return(
      <DashboardLayout title="New Team">
        <form onSubmit={this.handleSubmit}>
          <label>Team Name</label>
          <input type="text" name ="name" value={this.state.name} onChange={this.handleInputUpdate} />
          <button type="submit">Create Team</button>
        </form>
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createTeam }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamNew);
