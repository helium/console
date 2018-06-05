import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});

@withStyles(styles)
class ConfirmEmailPrompt extends Component {

  render() {
    const { classes } = this.props

    return (
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Registration Successful
            </Typography>
            <Typography component="p">
              Please check your inbox for a confirmation email
            </Typography>
            <Typography component="p">
              In Development: Visit <a href="/sent_emails">/sent_emails</a> to see the email
            </Typography>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }
}

export default ConfirmEmailPrompt
