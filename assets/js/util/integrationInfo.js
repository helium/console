import Aws from "../../img/channels/aws-channel.svg";
import AwsDark from "../../img/channels/aws-dark.png";
import Azure from "../../img/channels/azure-channel.svg";
import AzureDark from "../../img/channels/azure-dark.svg";
import Http from "../../img/channels/http-channel.svg";
import HttpDark from "../../img/channels/http-dark.png";
import IotCentral from "../../img/channels/iot-central-channel.svg";
import IotCentralDark from "../../img/channels/iot-central-dark.svg";
import Mqtt from "../../img/channels/mqtt-channel.svg";
import MqttDark from "../../img/channels/mqtt-dark.png";

// Community integration images
import Adafruit from "../../img/channels/community/adafruit.png";
import AdafruitDark from "../../img/channels/community/flows/adafruit-dark.png";
import Akenza from "../../img/channels/community/akenza.png";
import AkenzaDark from "../../img/channels/community/flows/akenza-dark.png";
import Cargo from "../../img/channels/community/cargo.svg";
import CargoDark from "../../img/channels/community/flows/cargo-dark.png";
import Datacake from "../../img/channels/community/datacake.png";
import DatacakeDark from "../../img/channels/community/flows/datacake-dark.png";
import GoogleSheet from "../../img/channels/community/google-sheet-channel.svg";
import GoogleSheetDark from "../../img/channels/community/flows/google-sheet-dark.svg";
import Microshare from "../../img/channels/community/microshare.png";
import MicroshareDark from "../../img/channels/community/flows/microshare-dark.png";
import MyDevices from "../../img/channels/community/mydevices.svg";
import MyDevicesDark from "../../img/channels/community/flows/mydevices-dark.png";
import Tago from "../../img/channels/community/tago.png";
import TagoDark from "../../img/channels/community/flows/tago-dark.png";
import Ubidots from "../../img/channels/community/ubidots.png";
import UbidotsDark from "../../img/channels/community/flows/ubidots-dark.png";

export const integrationImgMap = {
  adafruit: AdafruitDark,
  aws: AwsDark,
  azure: AzureDark,
  iot_central: IotCentralDark,
  cargo: CargoDark,
  my_devices: MyDevicesDark,
  datacake: DatacakeDark,
  http: HttpDark,
  mqtt: MqttDark,
  tago: TagoDark,
  ubidots: UbidotsDark,
  google_sheets: GoogleSheetDark,
  microshare: MicroshareDark,
  akenza: AkenzaDark,
};

export const http_integrations = ["http", "cargo", "my_devices", "akenza", "datacake", "microshare", "tago", "ubidots", "google_sheets", "test"]
export const mqtt_integrations = ["mqtt", "adafruit"]
export let allowedIntegrations
try {
  // To customize allowed integrations, copy allowed-integrations.json file from templates folder to root foler
  allowedIntegrations = require("../../../allowed-integrations.json");
} catch (err) {}

const core_integrations = [
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
  {
    name: "Azure IoT Central",
    type: "iot_central",
    img: `${IotCentral}`,
    info: "This Integration facilitates connecting your devices to Azure IoT Central.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/azure/#on-azure-iot-central",
  },
  // { name: "Google IoT", type: "google", img: `${Google}`, inactive: true },
];
export const CORE_INTEGRATION_TYPES = allowedIntegrations ? core_integrations.filter(i => allowedIntegrations[i.type]) : core_integrations

const community_integrations = [
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
    type: "my_devices",
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
    type: "google_sheets",
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
  {
    name: "Akenza",
    type: "akenza",
    img: `${Akenza}`,
    info: "This Integration simplifies sending data to the Akenza platform.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/akenza",
  },
];
export const COMMUNITY_INTEGRATION_TYPES = allowedIntegrations ? community_integrations.filter(i => allowedIntegrations[i.type]) : community_integrations
