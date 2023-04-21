import React, { useEffect } from 'react';
import { getRedirectResult } from '../../actions/magic';

const MagicSocialCallback = () => {
  useEffect(() => {
    getRedirectResult()
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
      <p>Please wait while you are automatically redirected...</p>
    </div>
  );
};
export default MagicSocialCallback;
