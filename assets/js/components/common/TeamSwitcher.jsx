import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchTeams, switchTeam } from '../../actions/team'

// MUI
import Button from 'material-ui/Button'
import Menu, { MenuItem } from 'material-ui/Menu';

// Icons
import ArrowIcon from 'material-ui-icons/ArrowDropDown';

class TeamSwitcher extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null,
      teamMenuOpen: false,
    }

    this.openTeamMenu = this.openTeamMenu.bind(this)
    this.closeTeamMenu = this.closeTeamMenu.bind(this)
    this.handleSwitchTeam = this.handleSwitchTeam.bind(this)
  }

  openTeamMenu(event) {
    this.setState({ anchorEl: event.currentTarget, teamMenuOpen: true });
  };

  closeTeamMenu() {
    this.setState({ anchorEl: null, teamMenuOpen: false });
  };

  handleSwitchTeam(team) {
    const { switchTeam } = this.props
    switchTeam(team.id)
    this.closeTeamMenu()
  }

  render() {
    const { anchorEl, teamMenuOpen } = this.state
    const { teams, currentTeam, switchTeam } = this.props

    return (
      <div>
        <Button onClick={this.openTeamMenu} color="inherit" size="small">
          {currentTeam && currentTeam.name}
          <ArrowIcon />
        </Button>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={teamMenuOpen}
          onClose={this.closeTeamMenu}
        >
          {teams.map(team => (
            <MenuItem onClick={() => this.handleSwitchTeam(team)}>{team.name}</MenuItem>
          ))}
        </Menu>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    teams: Object.values(state.entities.teams),
    currentTeam: state.entities.teams[state.auth.currentTeamId]
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchTeams, switchTeam }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamSwitcher);
