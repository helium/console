export const UPDATE_DISPLAY_SETTING = 'UPDATE_DISPLAY_SETTING';

export const updateDisplay = (desktopOnly) => {
  if (desktopOnly) {
    window.Intercom('update', { "hide_default_launcher": false });
  } else {
    if (window.innerWidth < 721) {
      window.Intercom('update', { "hide_default_launcher": true });
    }
  }

  return {
    type: UPDATE_DISPLAY_SETTING,
    desktopOnly
  };
}
