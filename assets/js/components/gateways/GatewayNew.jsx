import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import { createGateway } from '../../actions/gateway'
import { randomName, randomMac, randomLatitude, randomLongitude } from '../../util/random'

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

@connect(null, mapDispatchToProps)
class GatewayNew extends Component {
  constructor(props) {
    super(props)

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      gatewayName: '',
    }
  }

  handleInputUpdate(e) {
    this.setState({ gatewayName: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault()
    this.props.createGateway({
      name: this.state.gatewayName,
      mac: randomMac(),
      latitude: randomLatitude(),
      longitude: randomLongitude(),
      status: "pending"
    }, true)
  }

  render() {
    return(
      <DashboardLayout title="Register Gateway">
        <Card>
          <CardContent>
            <Typography variant="headline">
              Step 1
            </Typography>

            <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
              Choose a name for your Gateway
            </Typography>

            <div style={{width: '50%'}}>
              <form onSubmit={this.handleSubmit}>
                <TextField
                  type="text"
                  label="Name"
                  name="gatewayName"
                  value={this.state.gatewayName}
                  onChange={this.handleInputUpdate}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="raised"
                  color="primary"
                  size="large"
                  style={{marginTop: 24}}
                >
                  Continue
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createGateway }, dispatch);
}

export default GatewayNew
