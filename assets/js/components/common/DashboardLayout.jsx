import React, { Component } from 'react'

import { withStyles } from 'material-ui/styles';
import withRoot from './withRoot.jsx'

import TopBar from './TopBar'
import NavDrawer from './NavDrawer'

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%',
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  main: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    // padding: theme.spacing.unit * 3,
    marginTop: 48,
    overflowY: 'scroll'
  },
});

class DashboardLayout extends Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <TopBar classes={{appBar: classes.appBar}} title={this.props.title} />

        <NavDrawer />

        <main className={classes.main}>
          {this.props.children}
        </main>
      </div>
    )
  }
}

export default withRoot(withStyles(styles)(DashboardLayout))
