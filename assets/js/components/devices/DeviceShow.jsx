import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchDevice, deleteDevice, updateDevice } from '../../actions/device'
import EventsTable from '../events/EventsTable'
import RandomEventButton from '../events/RandomEventButton'
import DashboardLayout from '../common/DashboardLayout'
import GroupsControl from '../common/GroupsControl'
import BubbleChart from '../common/BubbleChart'

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class DeviceShow extends Component {
  componentDidMount() {
    const { fetchDevice } = this.props
    const { id } = this.props.match.params
    fetchDevice(id)
  }

  render() {
    const { device, events, deleteDevice, updateDevice } = this.props

    if (device === undefined) return (<div>loading...</div>)
    return(
      <DashboardLayout title={device.name}>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Device Details
            </Typography>

            <div style={{display: 'flex'}}>
              <div style={{width: '50%'}}>
                <Typography component="p">
                  ID: {device.id}
                </Typography>
                <Typography component="p">
                  Name: {device.name}
                </Typography>
                <Typography component="p">
                  MAC: {device.mac}
                </Typography>
              </div>
              <div style={{width: '50%'}}>
                <GroupsControl
                  groups={device.groups}
                  handleUpdate={(groups) => updateDevice(device.id, {groups: groups})}
                />
              </div>
            </div>
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

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Real Time Packets
            </Typography>
            <div className="chart-legend left">
              <div className="chart-legend-bulb red"></div>
              <Typography component="p">
                Live Data
              </Typography>
            </div>
            <div className="chart-legend right">
              <div className="chart-legend-bulb blue"></div>
              <Typography component="p">
                From Atom
              </Typography>
              <div className="chart-legend-bulb green"></div>
              <Typography component="p">
                To Atom
              </Typography>
            </div>
            <BubbleChart data={this.props.events}/>
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
  return bindActionCreators({ fetchDevice, deleteDevice, updateDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceShow);
