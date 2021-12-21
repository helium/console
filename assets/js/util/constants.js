import { store } from "../store/configureStore";

export const minWidth = 700;

export const checkIfDevicesNotInFilter = (label) =>
  label.devices.filter((device) => device.in_xor_filter === false).length > 0;

export const isMobile =
  window.innerWidth < 721 || !store.getState().display.desktopOnly;
