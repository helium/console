import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import pick from 'lodash/pick'
import EventsTable from '../events/EventsTable'
import DashboardLayout from '../common/DashboardLayout'
import HttpDetails from './HttpDetails'
import PacketGraph from '../common/PacketGraph'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import { updateChannel } from '../../actions/channel'
import { CHANNEL_FRAGMENT, CHANNEL_SUBSCRIPTION } from '../../graphql/channels'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

const query = gql`
  query ChannelShowQuery ($id: ID!) {
    channel(id: $id) {
      ...ChannelFragment
      method
      endpoint
      inbound_token
      devices {
        name
        team_id
      }
    }
  }
  ${CHANNEL_FRAGMENT}
`

@graphql(query, queryOptions)
@connect(mapStateToProps, mapDispatchToProps)
class ChannelShow extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newName: "",
      credentials: {}
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleUpdateDetailsInput = this.handleUpdateDetailsInput.bind(this);
    this.handleUpdateDetailsChange = this.handleUpdateDetailsChange.bind(this);
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data
    const channelId = this.props.match.params.id
    console.log("ACTION_NAV_CHANNEL_SHOW", channelId)

    subscribeToMore({
      document: CHANNEL_SUBSCRIPTION,
      variables: { channelId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleUpdateDetailsInput(credentials) {
    this.setState({ credentials })
  }

  handleNameChange() {
    const { channel } = this.props.data
    console.log("ACTION_UPDATE_CHANNEL_NAME", channel.id, this.state.newName)
    this.props.updateChannel(channel.id, { name: this.state.newName })
    this.setState({ newName: ""})
  }

  handleUpdateDetailsChange() {
    const { channel } = this.props.data
    const { credentials } = this.state
    console.log("ACTION_UPDATE_CHANNEL_DETAILS", channel.id)
    this.props.updateChannel(channel.id, { credentials })
    this.setState({ credentials: {} })
  }

  renderForm() {
    const { channel } = this.props.data

    switch (channel.type) {
      case "aws":
        return <AWSForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      case "google":
        return <GoogleForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      case "mqtt":
        return <MQTTForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      case "http":
        return <HTTPForm onValidInput={this.handleUpdateDetailsInput} type="update" />
      default:
        return <AzureForm onValidInput={this.handleUpdateDetailsInput} type="update" />
    }
  }

  render() {
    const { loading, channel } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={channel.name}>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Channel Details
            </Typography>

            <div>
              <Typography component="p">
                Type: {channel.type_name}
              </Typography>
              <Typography component="p">
                Active: {channel.active ? "Yes" : "No"}
              </Typography>
              <Typography component="p">
                ID: {channel.id}
              </Typography>
              <Typography component="p" style={{ marginTop: 12 }}>
                Name: {channel.name}
              </Typography>
            </div>

            <div>
              <TextField
                name="newName"
                value={this.state.newName}
                onChange={this.handleInputUpdate}
              />
              <Button
                size="small"
                color="primary"
                style={{ marginLeft: 5 }}
                onClick={this.handleNameChange}
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {channel.type === "http" && <HttpDetails channel={channel} />}

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Devices Piped
            </Typography>
            {
              channel.devices.map(d => (
                <React.Fragment key={d.name}>
                  <Typography component="p">
                    {this.props.teams[d.team_id].name}: {d.name}
                  </Typography>
                </React.Fragment>
              ))
            }
            {
              channel.default && <Typography component="p">
                Default Channel for New Devices
              </Typography>
            }
            {
              !channel.default && channel.devices.length === 0 && <Typography component="p">
                0 Connected Devices
              </Typography>
            }
          </CardContent>
        </Card>

        <Card style={{marginTop: 24}}>
          <CardContent>
            {this.renderForm()}
            <Button
              size="small"
              color="primary"
              style={{ marginTop: 24 }}
              onClick={this.handleUpdateDetailsChange}
            >
              Update Details
            </Button>
          </CardContent>
        </Card>

        {
          false && <Card style={{marginTop: 24}}>
            <CardContent>
              <Typography variant="headline" component="h3">
                Event Log
              </Typography>
              <EventsTable contextId={channel.id} contextName="channels"/>
            </CardContent>
          </Card>
        }

        {
          false && <Card style={{marginTop: 24}}>
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
              <PacketGraph contextId={channel.id} contextName="channels"/>
            </CardContent>
          </Card>
        }
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    teams: state.entities.teams
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default ChannelShow
