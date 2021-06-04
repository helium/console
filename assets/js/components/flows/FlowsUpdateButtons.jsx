import React, { useState } from 'react';
import { Typography, Button } from 'antd';
const { Text } = Typography

export default ({ hasChanges, resetElementsMap, submitChanges }) => {
  if (hasChanges) {
    return (
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 150,
        padding: 10,
        backgroundColor: "#ffffff",
        borderRadius: 6,
        boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={resetElementsMap}
            size="small"
          >
            Undo Changes
          </Button>
          <Button
            onClick={submitChanges}
            size="small"
            type="primary"
            style={{ marginLeft: 12 }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    )
  } else return <div />
};
