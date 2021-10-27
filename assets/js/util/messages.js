import { message } from "antd";

const timeouts = {};

const debounceMessage = (key, messageCallback) => {
  if (timeouts[key]) return;
  timeouts[key] = setTimeout(() => {
    delete timeouts[key];
  }, 300);
  messageCallback();
};

export const displayInfo = (msg) => {
  if (msg) {
    debounceMessage(msg, () => message.success(msg));
  }
};

export const displayError = (errorMsg) => {
  const msg =
    errorMsg ||
    "An unexpected error has occurred, please refresh the page and try again";
  debounceMessage(msg, () => message.error(msg));
};
