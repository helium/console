import React, { Component } from 'react';
import QRCode from 'qrcode.react';

class TwoFactorForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      twoFactorCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSkip = this.handleSkip.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.onSubmit(this.state.twoFactorCode)
  }

  handleSkip() {
    this.props.onSkip()
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
  }

  render() {
    if (this.props.twoFactorEnabled) {
      return(
        <div>
          <form onSubmit={this.handleSubmit}>
            <label>2FA Code</label>
            <input name ="twoFactorCode" value={this.state.twoFactorCode} onChange={this.handleInputUpdate} />
            <button type="submit">Submit</button>
          </form>
        </div>
      )
    } else {
      return(
        <div>
          <p>Set up multi-factor authentication by scanning the QR code below, we highly recommend it.</p>
          <QRCode value={this.props.secret2fa} />
          <form onSubmit={this.handleSubmit}>
            <label>2FA Code</label>
            <input name ="twoFactorCode" value={this.state.twoFactorCode} onChange={this.handleInputUpdate} />
            <button type="submit">Submit</button>
          </form>
          <button onClick={this.handleSkip}>Skip</button>
        </div>
      )
    }
  }
}

export default TwoFactorForm;
