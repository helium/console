import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useStoreActions } from 'react-flow-renderer';

export default ({ toggle, show, width, children }) => {
  const setSelectedElements = useStoreActions((actions) => actions.setSelectedElements);

  const handleToggle = () => {
    toggle();
    setSelectedElements([]);
  }

  return (
    <div style={{
      background: 'white',
      position: 'absolute',
      top: 55,
      width: show ? width : 0,
      height: 'calc(100vh - 55px)',
      right: 0,
      zIndex: show ? 10 : 1,
      padding: 0,
      transition: 'all 0.5s ease',
      boxShadow: '10px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
    }}>
      {show && (
        <React.Fragment>
          <Button 
            style={{ border: 'none', top: '35px', left: '35px' }} 
            onClick={handleToggle} 
            icon={<CloseOutlined style={{ fontSize: 30, color: '#D2DDE8' }} />}
          />
          {children}
        </React.Fragment>
      )}
    </div>
  );
}
