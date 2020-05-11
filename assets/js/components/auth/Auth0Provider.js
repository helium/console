import React, { useState, useEffect, useContext } from 'react'
import { history } from '../../store/configureStore'
import createAuth0Client from '@auth0/auth0-spa-js'

const DEFAULT_REDIRECT_CALLBACK = () => {
  history.replaceState({}, document.title, window.location.pathname);
}

export const Auth0Context = React.createContext();
export const useAuth0 = () => useContext(Auth0Context);

let _initOptions;

const getAuth0Client = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await createAuth0Client(_initOptions);
      resolve(client);
    } catch (e) {
      reject(new Error('Failed to get auth0 client'));
    }
  })
}

export const getIdTokenClaims = async (...p) => {
  const client = await getAuth0Client();
  return await client.getIdTokenClaims(...p);
}

export const logout = async (...p) => {
  const client = await getAuth0Client();
  return await client.logout(...p);
}

export const Auth0Provider = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  ...initOptions
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState();
    const [user, setUser] = useState();
    const [auth0Client, setAuth0] = useState();
    const [loading, setLoading] = useState(true);
    const [popupOpen, setPopupOpen] = useState(false);

    useEffect(() => {
      const initAuth0 = async () => {
        _initOptions = initOptions;
        const auth0FromHook = await getAuth0Client();
        setAuth0(auth0FromHook);
        
        if (
          window.location.search.includes("code=") &&
          window.location.search.includes("state=")
        ) {
          const { appState } = await auth0FromHook.handleRedirectCallback();
          onRedirectCallback(appState);
        }
        
        const isAuthenticated = await auth0FromHook.isAuthenticated();
        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          const user = await auth0FromHook.getUser();
          setUser(user);
        }
        
        setLoading(false);
      };
      initAuth0();
    }, []);

    const loginWithPopup = async (params = {}) => {
      setPopupOpen(true);
      try {
        await auth0Client.loginWithPopup(params);
      } catch (e) {
        console.error(e);
      } finally {
        setPopupOpen(false);
      }
      const user = await auth0Client.getUser();
      setUser(user);
      setIsAuthenticated(true);
    };

    const handleRedirectCallback = async () => {
        setLoading(true);
        await auth0Client.handleRedirectCallback();
        const user = await auth0Client.getUser();
        setLoading(false);
        setIsAuthenticated(true);
        setUser(user);
    };

    return (
      <Auth0Context.Provider
        value={{
          isAuthenticated,
          user,
          loading,
          popupOpen,
          loginWithPopup,
          handleRedirectCallback,
          getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
          loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
          getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
          getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
          logout: (...p) => auth0Client.logout(...p)
        }}
      >
        {children}
      </Auth0Context.Provider>
    )
}
