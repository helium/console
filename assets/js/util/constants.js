import { store } from "../store/configureStore";

export const minWidth = 700;

export const checkIfDevicesNotInFilter = (label) =>
  label.devices.filter((device) => device.in_xor_filter === false).length > 0;

export const isMobile =
  window.innerWidth < 721 || !store.getState().display.desktopOnly;

export const SUPPORTED_REGIONS = [
  "US915",
  "AU915",
  "EU868",
  "CN470",
  "AS923_1",
  "AS923_2",
  "AS923_3",
  "AS923_4",
];
