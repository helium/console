import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { changePassword } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'

//MUI
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  formButton: {
    marginTop: theme.spacing.unit * 2,
  },
  extraLinks: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
      passwordConfirm: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { password, passwordConfirm } = this.state;
    const token = this.props.match.params.token

    this.props.changePassword(password, passwordConfirm, token);
  }

  render() {
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Reset your password
            </Typography>

            <form onSubmit={this.handleSubmit}>
              <TextField
                type="password"
                label="New Password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputUpdate}
                fullWidth
                style={{marginBottom: 16}}
              />

              <TextField
                type="password"
                label="Confirm Password"
                name="passwordConfirm"
                value={this.state.passwordConfirm}
                onChange={this.handleInputUpdate}
                fullWidth
                style={{marginBottom: 16}}
              />

              <Button
                type="submit"
                variant="raised"
                color="primary"
                size="large"
                className={classes.formButton}
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Typography component="p" className={classes.extraLinks}>
          <Link to="/login">
            Login page
          </Link>
        </Typography>
      </AuthLayout>
    );
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ changePassword }, dispatch);
}

const styled = withStyles(styles)(ResetPassword)
export default connect(mapStateToProps, mapDispatchToProps)(styled);
