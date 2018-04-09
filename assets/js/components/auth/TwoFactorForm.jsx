import React, { Component } from 'react';
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
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
  forgot: {
    textAlign: 'right',
    marginBottom: theme.spacing.unit * 2,
  },
  formButton: {
    marginTop: theme.spacing.unit * 2,
  },
  extraLinks: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

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
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Enter Two Factor Code
            </Typography>

            <form onSubmit={this.handleSubmit}>
              <TextField
                label="Two Factor Code"
                name="twoFactorCode"
                value={this.state.twoFactorCode}
                onChange={this.handleInputUpdate}
                className={classes.input}
                fullWidth
              />
              <Button
                type="submit"
                variant="raised"
                color="primary"
                size="large"
                className={classes.formButton}
              >
                Confirm
              </Button>
            </form>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }
}

export default withStyles(styles)(TwoFactorForm)
