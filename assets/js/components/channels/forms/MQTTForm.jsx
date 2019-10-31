import React, { Component } from 'react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

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
    const { type } = this.props

    return(
      <div>
        <Typography variant="headline">
          {type === "update" ? "Update Channel" : "Step 2"}
        </Typography>

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          {type === "update" ? "Update your MQTT Connection Details" : "Enter your MQTT Connection Details"}
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
      </div>
    );
  }
}

export default MQTTForm;
