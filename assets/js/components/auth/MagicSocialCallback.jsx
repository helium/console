import React, { useEffect } from 'react';
import { Spin } from "antd";
import { getRedirectResult } from '../../actions/magic';

const MagicSocialCallback = () => {
  useEffect(() => {
    getRedirectResult()
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
      <Spin size="large" />
    </div>
  );
};
export default MagicSocialCallback;
