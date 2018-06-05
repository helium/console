import React, { Component } from 'react'
import Chip from '@material-ui/core/Chip';
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  chip: {
    textTransform: 'uppercase',
    height: '24px',
  },
  label: {
    fontSize: '0.7rem',
    letterSpacing: '0.02rem',
    paddingLeft: '10px',
    paddingRight: '10px',
  }
})

@withStyles(styles)
class SmallChip extends Component {
  render() {
    const { classes } = this.props

    return (
      <Chip {...this.props} classes={{root: classes.chip, label: classes.label}} />
    )
  }
}

export default SmallChip
