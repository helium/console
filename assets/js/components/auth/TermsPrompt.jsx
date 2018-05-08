import React, { Component } from 'react';
import ReactDOM from "react-dom"
import { Link } from 'react-router-dom';

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';
import TermsRaw from './TermsRaw.jsx';

const styles = theme => ({
  card: {
    marginBottom: theme.spacing.unit * 4,
  },
  terms: {
    boxShadow: 'inset 0 0 10px #9E9E9E',
    padding: '20px',
    height: '80vh',
    overflowY: 'scroll'
  },
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
  },
});

class TermsPrompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scrolledToBottom: false
    }
    this.handleScroll = this.handleScroll.bind(this)
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this.termsContainer).addEventListener("scroll", this.handleScroll)
  }

  componentWillUnmount() {
    ReactDOM.findDOMNode(this.termsContainer).removeEventListener("scroll", this.handleScroll)
  }

  handleScroll(e) {
    const scrolledToBottom = (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight)
    if (scrolledToBottom) {
      this.setState({ scrolledToBottom })
    }
  }

  render() {
    const { classes } = this.props

    return (
      <Card className={classes.card}>
        <CardContent>
          <div className={classes.terms} ref={elem => (this.termsContainer = elem)}>
            <TermsRaw />
          </div>

          <form onSubmit={this.props.handleSubmit} noValidate>
            <Button
              type="submit"
              variant="raised"
              disabled={!this.state.scrolledToBottom}
              color="primary"
              size="large"
              fullWidth
              className={classes.formButton}
              >
              I Agree
            </Button>
          </form>

          <Typography component="p" className={classes.extraLinks}>
            <Link to="/">
              I do not agree, take me back to homepage
            </Link>
          </Typography>
        </CardContent>
      </Card>
    )
  }
}

const styled = withStyles(styles)(TermsPrompt)
export default styled
