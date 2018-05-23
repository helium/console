import React, { Component } from 'react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

class AWSForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state ={
      accessKeyId: "",
      secretAccessKey: "",
      region: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const {accessKeyId, secretAccessKey, region } = this.state
      if (accessKeyId.length > 0 && secretAccessKey.length > 0 && region.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          accessKeyId,
          secretAccessKey,
          region
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
            Enter your AWS Connection Details
          </Typography>

          <div style={{width: '50%'}}>
            <TextField
              type="text"
              label="Access Key ID"
              name="accessKeyId"
              value={this.state.accessKeyId}
              onChange={this.handleInputUpdate}
              fullWidth
            />

            <TextField
              type="text"
              label="Secret Access Key"
              name="secretAccessKey"
              value={this.state.secretAccessKey}
              onChange={this.handleInputUpdate}
              fullWidth
            />

            <TextField
              type="text"
              label="Region"
              name="region"
              value={this.state.region}
              onChange={this.handleInputUpdate}
              fullWidth
            />
          </div>
        </CardContent>
      </Card>
    );
  }
}

export default AWSForm;
