import { store } from '../store/configureStore';

export const intercomResizeListen = () => {
  if (window.innerWidth < 721) {
    window.Intercom('update', { "hide_default_launcher": true });
  }

  window.addEventListener('resize', event => {
    if (window.innerWidth < 721 && !store.getState().display.desktopOnly) {
      window.Intercom('update', { "hide_default_launcher": true });
    } else {
      window.Intercom('update', { "hide_default_launcher": false });
    }
  }, true);
}
