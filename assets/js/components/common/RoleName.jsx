import React from 'react';

const RoleName = ({ role }) => {
  switch(role) {
    case 'admin':
      return <span>Administrator</span>
    case 'manager':
      return <span>Manager</span>
    case 'read':
      return <span>Read-Only</span>
    default:
      return <span>{role}</span>
  }
}

export default RoleName
