import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createDevice } from '../../actions/device'
import { randomMac } from '../../util/random'

// MUI
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  paper: {
    margin: 'auto',
    marginTop: '10%',
    width: '50%',
    padding: theme.spacing.unit * 2,
    minWidth: 420,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
})

@withStyles(styles)
@connect(mapStateToProps, mapDispatchToProps)
class NewDeviceModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: ""
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name } = this.state;

    this.props.createDevice({ name, mac: randomMac() })

    this.props.onClose()
  }

  render() {
    const { open, onClose, classes } = this.props

    return (
      <Modal
        open={open}
        onClose={onClose}
      >
        <Paper className={classes.paper}>
          <Typography variant="title">
            Create a new device
          </Typography>

          <form onSubmit={this.handleSubmit}>
            <TextField
              label="Device Name"
              name="name"
              value={this.state.name}
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
              Create Device
            </Button>
          </form>
        </Paper>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch)
}

export default NewDeviceModal
