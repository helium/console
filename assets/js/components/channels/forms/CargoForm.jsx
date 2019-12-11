import React, { Component } from 'react';

//MUI
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class CargoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      method: "post",
      endpoint: "https://cargo.helium.com/api/payloads",
      headers: [
        { header: "", value: "" }
      ]
    }

    this.validateInput = this.validateInput.bind(this)
  }

  validateInput() {
    const { method, endpoint, headers } = this.state
    if (method.length > 0 && endpoint.length > 0) {
      const parsedHeaders = headers.reduce((a, h) => {
        if (h.header !== "" && h.value !== "") a[h.header] = h.value
        return a
      }, {})

      this.props.onValidInput({
        method,
        endpoint,
        headers: parsedHeaders,
      })
    }
  }

  render() {
    return(
      <div>
        <Typography variant="headline">
          Step 2
        </Typography>

        <Typography component="p" style={{marginTop: 12 }}>
          You are opting to test your devices on the Helium Cargo HTTP channel endpoint.
        </Typography>

        <Typography component="p" style={{marginTop: 12 }}>
          Helium Cargo is an evaluation tool and the data collected is available to all developers.
        </Typography>

        <Typography component="p" style={{marginTop: 12 }}>
          Please do not share any sensitive information. Use as your own discretion.
        </Typography>

        <Button
          onClick={this.validateInput}
          variant="raised"
          color="primary"
          size="large"
          style={{marginTop: 24}}
        >
          I AGREE
        </Button>
      </div>
    );
  }
}

export default CargoForm;
