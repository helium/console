import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import SelectedNodeIcon from './SelectedNodeIcon';

export default ({ data, fromSidebar, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      <div style={{
        background: '#2C79EE',
        padding: 15,
        borderRadius: 5,
        minWidth: 200,
        minHeight: 50,
        position: 'relative'
      }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        {!fromSidebar && (
          <Handle
            type="source"
            position="right"
            style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #2C79EE', height: '12px', width: '12px' }}
          />
        )}
        {fromSidebar && (
          <div style={{
            height: 12,
            width: 12,
            backgroundColor: 'white',
            borderRadius: 6,
            position: 'absolute',
            top: 'calc(50% - 6px)',
            right: -4,
            border: '3.5px solid #2C79EE'
          }} />
        )}
      </div>
    </Fragment>
  );
};
