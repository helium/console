import React, { Component } from 'react'
import { withRouter } from 'react-router'
import findIndex from 'lodash/findIndex'

// MUI
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

// Icons
import HelpIcon from '@material-ui/icons/Help';

const styles = theme => ({
  content: {
    padding: theme.spacing.unit * 3,
    overflowY: 'scroll'
  },
  contentNoPad: {
    overflowY: 'scroll'
  }
});

const TabContainer = (props) => {
  return (
    <div className={props.className}>
      {props.content}
    </div>
  )
}

@withRouter
@withStyles(styles)
class ContentLayout extends Component {

  constructor(props) {
    super(props)

    this.handleChangeTab = this.handleChangeTab.bind(this)
  }

  handleChangeTab(event, tabIndex) {
    const { tabs } = this.props
    const selectedTab = tabs[tabIndex]
    this.props.history.push(selectedTab.path)
  }

  renderTabs(tabs, classes) {
    const currentPath = this.props.match.path
    const currentTabIndex = findIndex(tabs, tab => tab.path === currentPath)

    return (
      <div>
        <AppBar position="static" elevation={0}>
          <Tabs value={currentTabIndex} onChange={this.handleChangeTab}>
            {tabs.map((tab, i) => <Tab key={i} label={tab.label} />)}
          </Tabs>
        </AppBar>

        {tabs.map((tab, i) => {
          if (currentTabIndex === i) {
            return <TabContainer key={i} content={tab.content} className={tab.noPadding ? classes.contentNoPad : classes.content} />
          }
        })}
      </div>
    )
  }

  render() {
    const { classes, title, tabs } = this.props

    return (
      <div>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="display1" color="inherit" style={{flex: 1}}>
              {title}
            </Typography>

            <IconButton onClick={() => alert('oh hai')} color="inherit">
              <HelpIcon />
            </IconButton>

          </Toolbar>
        </AppBar>

        {tabs && this.renderTabs(tabs, classes)}

        <div className={classes.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default ContentLayout
