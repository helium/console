import Azure from "../../img/azure-channel.svg";
import Aws from "../../img/aws-channel.svg";
import GoogleSheet from "../../img/google-sheet-channel.svg";
import Mqtt from "../../img/mqtt-channel.svg";
import Http from "../../img/http-channel.svg";
import Cargo from "../../img/heliumcargo.svg";
import MyDevices from "../../img/mydevices.svg";
import Adafruit from "../../img/adafruitio.png";
import Ubidots from "../../img/ubidots.png";
import Datacake from "../../img/datacake.png";
import Tago from "../../img/tago.png";
import Microshare from "../../img/microshare.png";

export const NEW_CHANNEL_TYPES = [
  {
    name: "HTTP",
    type: "http",
    img: `${Http}`,
    info: "This integration allows for sending data to an endpoint, as well as receiving data, over HTTP.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/http/",
  },
  {
    name: "MQTT",
    type: "mqtt",
    img: `${Mqtt}`,
    info: "This Integration allows for sending data to an endpoint, as well as receiving data, over the MQTT protocol.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/mqtt",
  },
  {
    name: "AWS IoT Core",
    type: "aws",
    img: `${Aws}`,
    info: "This Integration automates the complexity of securely connecting your devices to AWS IoT Core.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/aws-iot-core",
  },
  {
    name: "Azure IoT Hub",
    type: "azure",
    img: `${Azure}`,
    info: "This Integration facilitates connecting your devices to Azure IoT Hub.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/azure",
  },
  // { name: "Google IoT", type: "google", img: `${Google}`, inactive: true },
];

export const PREMADE_CHANNEL_TYPES = [
  {
    name: "Helium Cargo",
    type: "cargo",
    img: `${Cargo}`,
    info: "Cargo is an in-house mapping tool used at Helium.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/cargo",
  },
  {
    name: "myDevices Cayenne",
    type: "mydevices",
    img: `${MyDevices}`,
    info: "myDevices Cayenne lets you quickly visualize real-time data sent over the Helium Network.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/mydevices-cayenne",
  },
  {
    name: "Ubidots",
    type: "ubidots",
    img: `${Ubidots}`,
    info: "Use the Ubidots platform to send data to the cloud from any Internet-enabled device.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/ubidots",
  },
  {
    name: "Adafruit IO",
    type: "adafruit",
    img: `${Adafruit}`,
    info: "This Integration automates the complexity of securely connecting your devices to Adafruit IO.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/adafruitio",
  },
  {
    name: "Datacake",
    type: "datacake",
    img: `${Datacake}`,
    info: "This Integration simplifies sending data to the Datacake IoT platform.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/datacake",
  },
  {
    name: "TagoIO",
    type: "tago",
    img: `${Tago}`,
    info: "This Integration simplifies sending data to the TagoIO platform.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/tago",
  },
  {
    name: "Google Sheets",
    type: "googlesheet",
    img: `${GoogleSheet}`,
    info: "This Integration streamlines sending data to a Google Sheet by using a Google Form.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/google-sheets",
  },
  {
    name: "Microshare",
    type: "microshare",
    img: `${Microshare}`,
    info: "This Integration simplifies sending data to the Microshare IoT Platform",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/microshare",
  },
];
