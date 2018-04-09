import React, { Component } from 'react';

// MUI
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

// Icons
import Icon from 'material-ui-icons/SentimentNeutral';

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

const BlankSlate = (props) => {
  const { classes } = props

  return (
    <div className={classes.main}>
      <Icon className={classes.icon} />
      <Typography variant="display1" className={classes.title}>
        {props.title}
      </Typography>

      <Typography component="p" className={classes.subheading}>
        {props.subheading}
      </Typography>
    </div>
  )
}

export default withStyles(styles)(BlankSlate)
