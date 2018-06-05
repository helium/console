import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchTeams, switchTeam } from '../../actions/team'
import NewTeamModal from '../teams/NewTeamModal'

// MUI
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

// Icons
import ArrowIcon from '@material-ui/icons/ArrowDropDown';
import NewTeamIcon from '@material-ui/icons/Add';

@connect(mapStateToProps, mapDispatchToProps)
class TeamSwitcher extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null,
      teamMenuOpen: false,
      newTeamOpen: false,
    }

    this.openTeamMenu = this.openTeamMenu.bind(this)
    this.closeTeamMenu = this.closeTeamMenu.bind(this)
    this.handleSwitchTeam = this.handleSwitchTeam.bind(this)
    this.openNewTeamModal = this.openNewTeamModal.bind(this)
    this.closeNewTeamModal = this.closeNewTeamModal.bind(this)
  }

  openTeamMenu(event) {
    this.setState({ anchorEl: event.currentTarget, teamMenuOpen: true });
  };

  closeTeamMenu() {
    this.setState({ anchorEl: null, teamMenuOpen: false });
  };

  openNewTeamModal() {
    this.setState({newTeamOpen: true, teamMenuOpen: false})
  }

  closeNewTeamModal() {
    this.setState({newTeamOpen: false})
  }

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
          <ArrowIcon style={{marginLeft: 6}} />
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
          <MenuList
            subheader={<ListSubheader component="div" style={{padding: '14px 16px 14px', lineHeight: 0}}>Available Teams</ListSubheader>}
          >
            {teams.map(team => (
              <MenuItem key={team.id} onClick={() => this.handleSwitchTeam(team)}>{team.name}</MenuItem>
            ))}
          </MenuList>
          <Divider />

          <MenuItem onClick={this.openNewTeamModal}>
            <ListItemIcon>
              <NewTeamIcon style={{margin: 0}} />
            </ListItemIcon>
            <ListItemText inset primary="New Team" />
          </MenuItem>
        </Menu>

        <NewTeamModal
          open={this.state.newTeamOpen}
          onClose={this.closeNewTeamModal}
        />
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

export default TeamSwitcher
