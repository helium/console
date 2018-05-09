import React, { Component } from 'react';

//MUI
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';

class MQTTForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      endpoint: "",
      topic: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { endpoint, topic } = this.state
      if (endpoint.length > 0 && topic.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          endpoint,
          topic
        })
      }
    })
  }

  render() {
    return(
      <Card style={{marginTop: 24}}>
        <CardContent>
          <Typography variant="headline">
            Step 2
          </Typography>

          <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
            Enter your MQTT Connection Details
          </Typography>

          <div style={{width: '50%'}}>
            <TextField
              type="text"
              label="Endpoint"
              name="endpoint"
              value={this.state.endpoint}
              onChange={this.handleInputUpdate}
              fullWidth
            />

            <TextField
              type="text"
              label="Topic"
              name="topic"
              value={this.state.topic}
              onChange={this.handleInputUpdate}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default MQTTForm;
