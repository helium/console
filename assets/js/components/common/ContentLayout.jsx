import React, { Component } from 'react'

// MUI
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';

// Icons
import HelpIcon from 'material-ui-icons/Help';

const styles = theme => ({
  content: {
    padding: theme.spacing.unit * 3,
    overflowY: 'scroll'
  },
});

class ContentLayout extends Component {

  render() {
    const { classes, title } = this.props

    return (
      <div>
        <AppBar position="initial" elevation={0}>
          <Toolbar>
            <Typography variant="display1" color="inherit" style={{flex: 1}}>
              {title}
            </Typography>

            <IconButton onClick={() => alert('oh hai')} color="inherit">
              <HelpIcon />
            </IconButton>

          </Toolbar>
        </AppBar>
        <div className={classes.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ContentLayout)
