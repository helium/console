import React, { Component } from 'react'

// MUI
import { withStyles } from 'material-ui/styles';
import Badge from 'material-ui/Badge';

const styles = theme => ({
  badge: {
    width: 18,
    height: 18,
    fontSize: '0.7rem',
    top: -8,
    right: -8,
  }
})

class SmallBadge extends Component {
  render() {
    return (
      <Badge {...this.props}>
        {this.props.children}
      </Badge>
    )
  }
}

export default withStyles(styles)(SmallBadge)
