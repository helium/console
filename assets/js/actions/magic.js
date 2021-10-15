import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import { displayError } from '../util/messages'
import { store } from '../store/configureStore';
import { magicLogIn, logOut } from './auth'

export const magic = new Magic(window.magic_public_key || process.env.MAGIC_PUBLIC_KEY || 'pk_live_2D8497C8B0909EC7', {
  extensions: [new OAuthExtension()],
});

export const checkUser = async () => {
  const isLoggedIn = await magic.user.isLoggedIn();
  if (isLoggedIn) {
    const user = await magic.user.getMetadata();

    store.dispatch(magicLogIn({ isLoggedIn: true, email: user.email, sub: user.issuer }))
  }
};

export const loginUser = async (email) => {
  await magic.auth.loginWithMagicLink({ email });
  const user = await magic.user.getMetadata();

  store.dispatch(magicLogIn({ isLoggedIn: true, email: user.email, sub: user.issuer }))
};

export const loginGoogleUser = async () => {
  await magic.oauth.loginWithRedirect({
    provider: 'google',
    redirectURI: new URL('/callback', window.location.origin).href,
  });
}

export const getRedirectResult = async () => {
  await magic.oauth.getRedirectResult();
  window.location.replace("/")
}

export const logoutUser = async () => {
  await magic.user.logout();
};

export const getMagicSessionToken = async () => {
  const didToken = await magic.user.getIdToken()
  const res =
    await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + didToken,
      },
    });

  if (res.status === 201) {
    const data = await res.json();
    return data
  } else {
    displayError()
    store.dispatch(logOut())
    return null
  }
}
