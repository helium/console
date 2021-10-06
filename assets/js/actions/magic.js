import { Magic } from 'magic-sdk';
const magic = new Magic('pk_live_2D8497C8B0909EC7');
import { displayError } from '../util/messages'

export const checkUser = async (cb) => {
  const isLoggedIn = await magic.user.isLoggedIn();
  if (isLoggedIn) {
    const user = await magic.user.getMetadata();

    return cb({ isLoggedIn: true, email: user.email, sub: user.issuer });
  }
  return cb({ isLoggedIn: null, email: '', sub: '' });
};

export const loginUser = async (email) => {
  await magic.auth.loginWithMagicLink({ email });
};

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
  }
  displayError()
  return null
}
