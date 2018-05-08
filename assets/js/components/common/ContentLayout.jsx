import React, { Component } from 'react'

// MUI
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Tabs, { Tab } from 'material-ui/Tabs'

// Icons
import HelpIcon from 'material-ui-icons/Help';

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

class ContentLayout extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentTab: 0
    }

    this.handleChangeTab = this.handleChangeTab.bind(this)
  }

  handleChangeTab(event, value) {
    this.setState({currentTab: value})
  }

  renderTabs(tabs, classes) {
    const { currentTab } = this.state

    return (
      <div>
        <AppBar position="initial" elevation={0}>
          <Tabs value={currentTab} onChange={this.handleChangeTab}>
            {tabs.map((tab, i) => <Tab key={i} label={tab.label} />)}
          </Tabs>
        </AppBar>

        {tabs.map((tab, i) => {
          if (currentTab === i) {
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

        {tabs && this.renderTabs(tabs, classes)}

        <div className={classes.content}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ContentLayout)
