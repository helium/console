import React, { Component } from 'react'
import { connect } from 'react-redux';
import DashboardLayout from '../common/DashboardLayout'
import DemoEventsTable from './DemoEventsTable'
import EventGraph from '../common/EventGraph'
import RandomEventButton from './RandomEventButton'
import UserCan from '../common/UserCan'

// MUI
import Paper from '@material-ui/core/Paper';

@connect(mapStateToProps, null)
class DemoEvents extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.createDevice({
      name: randomName(),
      mac: randomMac(),
      public_key: "some public key"
    })
  }

  render() {
    const { currentTeamId } = this.props.auth
    return(
      <DashboardLayout title="All Events">
        <Paper>
          <EventGraph team_id={currentTeamId}/>
        </Paper>
        <Paper style={{marginTop: 24, marginBottom: 24}}>
          <DemoEventsTable team_id={currentTeamId}/>
        </Paper>

        <RandomEventButton team_id={currentTeamId} />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

export default DemoEvents
