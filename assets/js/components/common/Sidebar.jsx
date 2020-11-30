import React, { Component } from 'react';
import { debugSidebarBackgroundColor } from '../../util/colors'
import { Typography, Icon, Tooltip } from 'antd';
const { Text } = Typography

class Sidebar extends Component {

  state = {
    showMessage: false
  }

  constructor(props) {
    super(props);
  }

  handleToggle = () => {
    const { toggle, disabled } = this.props;
    if (!disabled) {
      toggle();
    }
  }

  render() {
    const { show, iconPosition, sidebarIcon, iconBackground, disabled, disabledMessage, message } = this.props;
    let topPercentage;
    switch (iconPosition) {
      case 'top':
        topPercentage = '44';
        break;
      case 'middle':
        topPercentage = '50';
        break;
      default:
        topPercentage = '56';
    }
    return (
      <div
        style={{
          background: debugSidebarBackgroundColor,
          position: 'absolute',
          top: 55,
          width: show ? 650 : 0,
          height: 'calc(100vh - 55px)',
          right: 0,
          zIndex: show ? 10 : 1,
          padding: 0,
          transition: 'all 0.5s ease',
        }}
      >
        <Tooltip title={disabled ? disabledMessage : message} placement='left'>
          <div
            style={{
              position: 'relative',
              left: '-60px',
              width: 50,
              height: 50,
              top: `calc(${topPercentage}% - 25px)`,
              backgroundColor: disabled ? 'grey' : iconBackground,
              borderRadius: '9999px',
              cursor: disabled ? 'default' : 'pointer',
              userSelect: 'none'
            }}
            onClick={this.handleToggle}
          >
            <Text style={{
              color: 'white',
              fontSize: 25,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform:'translate(-50% , -50%)'
            }}>
              {sidebarIcon}
            </Text>
          </div>
        </Tooltip>
        {
          show && this.props.children
        }
      </div>
    )
  }
}


export default Sidebar
