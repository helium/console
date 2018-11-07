import React, { Component } from 'react'
import sample from 'lodash/sample'

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createNotification } from '../../actions/notifications'

// MUI
import Button from '@material-ui/core/Button';

const randomNotification = () => (
  sample([
    {
      title: "Pending Hotspot Activation",
      body: "Confirm your pending hotspot activation",
      url: "/gateways",
      category: "gateways"
    },
    {
      title: "Hotspot Confirmed",
      body: "Hotspot successfully confirmed",
      url: "/gateways",
      category: "gateways"
    },
  ])
)

@connect(null, mapDispatchToProps)
class RandomNotificationButton extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    const { createNotification } = this.props
    createNotification(randomNotification())
  }

  render() {
    return (
      <Button onClick={this.handleClick} style={{marginTop: 10}}>Random Notification</Button>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createNotification }, dispatch);
}

export default RandomNotificationButton
