import React, { useState } from 'react';
import { Typography, Button } from 'antd';
const { Text } = Typography

export default ({ edgesToRemove, edgesToAdd, nodeDroppedIn, resetElementsMap, submitChanges }) => {
  if ((Object.keys(edgesToRemove).length + Object.keys(edgesToAdd).length) > 0 || nodeDroppedIn) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#f7f8fa',
        zIndex: 100,
        padding: 10,
        maxHeight: 'calc(100vh - 55px)',
        overflowY: 'scroll'
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={resetElementsMap}
            size="small"
          >
            Clear Changes
          </Button>
          <Button
            onClick={submitChanges}
            size="small"
            type="primary"
            style={{ marginLeft: 12 }}
          >
            Save
          </Button>
        </div>
      </div>
    )
  } else return <div />
};
