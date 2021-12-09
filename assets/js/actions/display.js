export const UPDATE_DISPLAY_SETTING = 'UPDATE_DISPLAY_SETTING';

export const updateDisplay = (desktopOnly) => {
  return {
    type: UPDATE_DISPLAY_SETTING,
    desktopOnly
  };
}
