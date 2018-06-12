import React, { Component } from 'react'

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createNotification } from '../../actions/notifications'

// MUI
import Button from '@material-ui/core/Button';

@connect(null, mapDispatchToProps)
class RandomNotificationButton extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    console.log("here")
    const { createNotification } = this.props
    createNotification({
      title: "hello",
      body: "something",
      category: "gateways"
    })
  }

  render() {
    return (
      <Button onClick={this.handleClick}>Random Notification</Button>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createNotification }, dispatch);
}

export default RandomNotificationButton
