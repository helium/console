import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchGateway, deleteGateway } from '../../actions/gateway'
import EventsTable from '../events/EventsTable'
import RandomEventButton from '../events/RandomEventButton'

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class GatewayShow extends Component {
  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchGateway(id)
  }

  render() {
    const { gateway, events, deleteGateway } = this.props

    if (gateway === undefined) return (<div>loading...</div>)

    return(
      <div>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Gateway Details
            </Typography>
            <Typography component="p">
              ID: {gateway.id}
            </Typography>
            <Typography component="p">
              Name: {gateway.name}
            </Typography>
            <Typography component="p">
              MAC: {gateway.mac}
            </Typography>
            <Typography component="p">
              Lat: {gateway.latitude}
            </Typography>
            <Typography component="p">
              Lng: {gateway.longitude}
            </Typography>
          </CardContent>

          <CardActions>
            <RandomEventButton gateway_id={gateway.id} />
            <Button
              size="small"
              color="secondary"
              onClick={() => deleteGateway(gateway)}
            >
              Delete Gateway
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
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const gateway = state.entities.gateways[ownProps.match.params.id]
  if (gateway === undefined) return {}
  return {
    gateway,
    events: Object.values(pick(state.entities.events, gateway.events))
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchGateway, deleteGateway }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(GatewayShow);
