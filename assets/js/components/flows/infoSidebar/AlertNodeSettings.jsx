import React from 'react';
import { Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';

export default () => (
  <div>
    <Button
      icon={<BellOutlined />}
      style={{ borderRadius: 4 }}
      onClick={() => {}}
    >
      Create New Alert
    </Button>
  </div>
)
