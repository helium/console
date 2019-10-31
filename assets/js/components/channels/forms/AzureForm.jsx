import React, { Component } from 'react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

class AzureForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      connectionString: "",
      hostName: "",
      accessKeyName: "",
      accessKey: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { connectionString } = this.state
      if (connectionString.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          connectionString
        })
      }
    })
  }

  render() {
    const { type } = this.props

    return (
      <div>
        <Typography variant="headline">
          Step 2
        </Typography>

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          Connection coming soon...
        </Typography>
      </div>
    )

    return(
      <div>
        <Typography variant="headline">
          {type === "update" ? "Update Channel" : "Step 2"}
        </Typography>

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          {type === "update" ? "Update your Azure Connection Details" : "Enter your Azure Connection Details"}
        </Typography>

        <div style={{width: '50%'}}>
          <TextField
            type="text"
            label="Connection String"
            name="connectionString"
            value={this.state.connectionString}
            onChange={this.handleInputUpdate}
            fullWidth
          />
          <p></p>

          <TextField
            type="text"
            label="Hostname"
            name="hostName"
            value={this.state.hostName}
            onChange={this.handleInputUpdate}
            fullWidth
            disabled={true}
          />

          <TextField
            type="text"
            label="Shared Access Key Name"
            name="accessKeyName"
            value={this.state.accessKeyName}
            onChange={this.handleInputUpdate}
            fullWidth
            disabled={true}
          />

          <TextField
            type="text"
            label="Shared Access Key"
            name="accessKey"
            value={this.state.accessKey}
            onChange={this.handleInputUpdate}
            fullWidth
            disabled={true}
          />
        </div>
      </div>
    );
  }
}

export default AzureForm;
