import React, { Component } from 'react';
import ReactDOM from "react-dom"

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';
import TermsRaw from './TermsRaw.jsx';

const styles = theme => ({
  card: {
    marginBottom: theme.spacing.unit * 4,
    marginLeft: '10%',
    marginRight: '10%',
  },
  terms: {
    boxShadow: 'inset 0 0 10px #9E9E9E',
    padding: '20px',
    height: '90vh',
    overflowY: 'scroll'
  },
});

@withStyles(styles)
class TermsPrompt extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props

    return (
      <Card className={classes.card}>
        <CardContent>
          <div className={classes.terms}>
            <TermsRaw />
          </div>
        </CardContent>
      </Card>
    )
  }
}

export default TermsPrompt
