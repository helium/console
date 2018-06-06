import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { deleteGateway } from '../../actions/gateway'
import EventsTable from '../events/EventsTablePaginated'
import RandomEventButton from '../events/RandomEventButton'
import DashboardLayout from '../common/DashboardLayout'
import Mapbox from '../common/Mapbox'
import PacketGraph from '../common/PacketGraph'
import userCan from '../../util/abilities'
import { GATEWAY_FRAGMENT } from '../../graphql/gateways'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  details: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  left: {
    width: "50%"
  },
  right: {
    width: "50%"
  },
})

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    }
  })
}

const query = gql`
  query GatewayShowQuery ($id: ID!) {
    gateway(id: $id) {
      ...GatewayFragment
    }
  }
  ${GATEWAY_FRAGMENT}
`

@withStyles(styles)
@connect(mapStateToProps, mapDispatchToProps)
@graphql(query, queryOptions)
class GatewayShow extends Component {
  render() {
    const { deleteGateway, classes } = this.props
    const { loading, gateway } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={gateway.name}>
        <Card>
          <CardContent className={classes.details}>
            <div className={classes.left}>
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
            </div>

            <div className={classes.right}>
              <Mapbox type={"gateways"} view={"show"} gateways={[gateway]}/>
            </div>
          </CardContent>

          <CardActions>
            {userCan('create', 'event') &&
              <RandomEventButton gateway_id={gateway.id} />
            }

            {userCan('delete', 'gateway', gateway) &&
              <Button
                size="small"
                color="secondary"
                onClick={() => deleteGateway(gateway.id, true)}
              >
                Delete Gateway
              </Button>
            }
          </CardActions>
        </Card>

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Event Log
            </Typography>
            <EventsTable contextName="gateways" contextId={gateway.id} />
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
                From Device
              </Typography>
              <div className="chart-legend-bulb green"></div>
              <Typography component="p">
                To Device
              </Typography>
            </div>
            <PacketGraph contextName="gateways" contextId={gateway.id} />
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteGateway }, dispatch);
}

export default GatewayShow
