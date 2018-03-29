import React, { Component } from 'react';

class TwoFactorForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      twoFactorCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.onSubmit(this.state.twoFactorCode)
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
  }

  render() {
    return(
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>2FA Code</label>
          <input name ="twoFactorCode" value={this.state.twoFactorCode} onChange={this.handleInputUpdate} />
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }
}

export default TwoFactorForm;
