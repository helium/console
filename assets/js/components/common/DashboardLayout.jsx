import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import withTheme from './withTheme.jsx'

import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'

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
    overflow: 'hidden',
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

@withTheme
@withStyles(styles)
class DashboardLayout extends Component {
  render() {
    const { classes, title, tabs } = this.props;

    return (
      <div className={classes.root}>
        <TopBar classes={{appBar: classes.appBar}} title={title} />

        <NavDrawer />

        <main className={classes.main} id="mainContainer">
          <ContentLayout title={title} tabs={tabs}>
            {this.props.children}
          </ContentLayout>
        </main>
      </div>
    )
  }
}

export default DashboardLayout
