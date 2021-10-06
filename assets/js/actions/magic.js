import { Magic } from 'magic-sdk';
const magic = new Magic('pk_live_2D8497C8B0909EC7');

export const checkUser = async (cb) => {
  const isLoggedIn = await magic.user.isLoggedIn();
  if (isLoggedIn) {
    const user = await magic.user.getMetadata();

    return cb({ isLoggedIn: true, email: user.email, user_id: user.issuer });
  }
  return cb({ isLoggedIn: false });
};

export const loginUser = async (email) => {
  await magic.auth.loginWithMagicLink({ email });
};

export const logoutUser = async () => {
  await magic.user.logout();
};
