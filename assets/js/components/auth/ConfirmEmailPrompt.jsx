import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});

const ConfirmEmailPrompt = (props) => (

  <AuthLayout>
    <Card>
      <CardContent>
        <Typography variant="headline" className={props.classes.title}>
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

export default withStyles(styles)(ConfirmEmailPrompt)
