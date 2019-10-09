import React, { Component } from 'react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

class GoogleForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      registryId: "",
      region: "",
      privateKey: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { registryId, region, privateKey } = this.state
      if (registryId.length > 0 && region.length > 0 && privateKey.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          registryId,
          privateKey,
          region
        })
      }
    })
  }

  render() {
    return (
      <Card style={{marginTop: 24}}>
        <CardContent>
          <Typography variant="headline">
            Step 2
          </Typography>

          <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
            Connection coming soon...
          </Typography>
        </CardContent>
      </Card>
    )
    
    return(
      <Card style={{marginTop: 24}}>
        <CardContent>
          <Typography variant="headline">
            Step 2
          </Typography>

          <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
            Enter your Google Details
          </Typography>

          <div style={{width: '50%'}}>
            <TextField
              type="text"
              label="Registry ID"
              name="registryId"
              value={this.state.registryId}
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

          <TextField
            type="text"
            label="JSON Private Key"
            name="privateKey"
            value={this.state.privateKey}
            onChange={this.handleInputUpdate}
            fullWidth
          />
        </CardContent>
      </Card>
    );
  }
}

export default GoogleForm;
