import React, { useEffect } from 'react';
import { getRedirectResult } from '../../actions/magic';

const MagicSocialCallback = ({ history }) => {
  const urlParams = new URLSearchParams(history.location.search)
  const fromGoogleAuth = urlParams.get('from-gauth') !== 'false'

  useEffect(() => {
    if (fromGoogleAuth) getRedirectResult()
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
      {
        fromGoogleAuth ? (
          <p>Please wait while you are automatically redirected...</p>
        ) : (
          <p>Login successful, you may close this window and go back to your original page.</p>
        )
      }
      
    </div>
  );
};
export default MagicSocialCallback;
