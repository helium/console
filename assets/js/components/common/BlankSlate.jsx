import React, { Component } from 'react';

// MUI
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

// Icons
import Icon from '@material-ui/icons/SentimentNeutral';

const styles = theme => ({
  main: {
    textAlign: 'center',
    padding: theme.spacing.unit * 10,
  },
  icon: {
    color: '#B0BEC5',
    width: 80,
    height: 80,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
    color: '#90A4AE',
  },
  subheading: {
    color: '#90A4AE',
  },
})


@withStyles(styles)
class BlankSlate extends Component {
  render() {
    const { classes, title, subheading } = this.props

    return (
      <div className={classes.main}>
        <Icon className={classes.icon} />
        <Typography variant="display1" className={classes.title}>
          {title}
        </Typography>

        <Typography component="p" className={classes.subheading}>
          {subheading}
        </Typography>
      </div>
    )
  }
}

export default BlankSlate
