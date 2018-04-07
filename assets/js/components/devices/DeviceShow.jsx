import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchDevice, deleteDevice } from '../../actions/device'
import EventsTable from '../events/EventsTable'
import DashboardLayout from '../common/DashboardLayout'
import RandomEventButton from '../events/RandomEventButton'

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class DeviceShow extends Component {
  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchDevice(id)
  }

  render() {
    const { device, events, deleteDevice } = this.props

    if (device === undefined) return (<div>loading...</div>)

    return(
      <DashboardLayout title="Device" current="devices">
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Device Details
            </Typography>
            <Typography component="p">
              ID: {device.id}
            </Typography>
            <Typography component="p">
              Name: {device.name}
            </Typography>
            <Typography component="p">
              MAC: {device.mac}
            </Typography>
          </CardContent>

          <CardActions>
            <RandomEventButton device_id={device.id} />
            <Button
              size="small"
              color="secondary"
              onClick={() => deleteDevice(device)}
            >
              Delete Device
            </Button>
          </CardActions>
        </Card>

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Event Log
            </Typography>
            <EventsTable events={events} />
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const device = state.entities.devices[ownProps.match.params.id]
  if (device === undefined) return {}
  return {
    device,
    events: Object.values(pick(state.entities.events, device.events))
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevice, deleteDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceShow);
