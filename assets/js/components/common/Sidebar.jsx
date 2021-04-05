import React, { Component } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Typography, Tooltip, Button } from 'antd';
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
    const { show, width, iconPosition, sidebarIcon, iconBackground, disabled, disabledMessage, message, backgroundColor } = this.props;
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
          background: backgroundColor,
          position: 'absolute',
          top: 55,
          width: show ? width : 0,
          height: 'calc(100vh - 55px)',
          right: 0,
          zIndex: show ? 10 : 1,
          padding: 0,
          transition: 'all 0.5s ease',
          boxShadow: '10px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
        }}
      >
        {this.props.sidebarIcon && 
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
                cursor: disabled ? 'not-allowed' : 'pointer',
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
        }
        {
          !this.props.sidebarIcon && show && (
            <Button 
              style={{ border: 'none', top: '35px', left: '35px' }} 
              onClick={this.handleToggle} 
              icon={<CloseOutlined style={{ fontSize: 30, color: '#D2DDE8' }} />}
            />
          )
        }
        {
          show && this.props.children
        }
      </div>
    )
  }
}


export default Sidebar
