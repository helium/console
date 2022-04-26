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
import Akenza from "../../img/akenza.png";
import IotCentral from "../../img/iot-central-channel.svg";

import AdafruitIcon from "../../img/channels/adafruit.png";
import AwsIcon from "../../img/channels/aws.png";
import AzureIcon from "../../img/channels/azure.svg";
import CargoIcon from "../../img/channels/cargo.png";
import CayenneIcon from "../../img/channels/cayenne.png";
import DatacakeIcon from "../../img/channels/datacake.png";
import HttpIcon from "../../img/channels/http.png";
import MqttIcon from "../../img/channels/mqtt.png";
import TagoIcon from "../../img/channels/tago.png";
import UbidotsIcon from "../../img/channels/ubidots.png";
import GoogleSheetIcon from "../../img/channels/google-sheet.svg";
import MicroshareIcon from "../../img/channels/microshare.png";
import AkenzaIcon from "../../img/channels/akenza.png";
import IotCentralIcon from "../../img/channels/iot-central.svg";

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
  {
    name: "Akenza",
    type: "akenza",
    img: `${Akenza}`,
    info: "This Integration simplifies sending data to the Akenza platform.",
    docLink:
      "https://docs.helium.com/use-the-network/console/integrations/akenza",
  },
];

export const getRootType = (type) => {
  switch (type) {
    case "cargo":
    case "mydevices":
    case "ubidots":
    case "datacake":
    case "tago":
    case "googlesheet":
    case "akenza":
    case "microshare":
      return "http";
    case "adafruit":
      return "mqtt";
    default:
      return type;
  }
};

export const integrationImgMap = {
  // adafruit: AdafruitIcon,
  aws: AwsIcon,
  azure: AzureIcon,
  iot_central: IotCentralIcon,
  // cargo: CargoIcon,
  // cayenne: CayenneIcon,
  // datacake: DatacakeIcon,
  http: HttpIcon,
  mqtt: MqttIcon,
  // tago: TagoIcon,
  // ubidots: UbidotsIcon,
  // googlesheets: GoogleSheetIcon,
  // microshare: MicroshareIcon,
  // akenza: AkenzaIcon,
};

export const getIntegrationTypeForFlows = (endpoint, type) => {
  // if (!endpoint) return type;
  // if (endpoint === "https://cargo.helium.com/api/payloads") return "cargo";
  // if (endpoint === "https://lora.mydevices.com/v1/networks/helium/uplink")
  //   return "cayenne";
  // if (endpoint === "https://api.datacake.co/integrations/lorawan/helium/")
  //   return "datacake";
  // if (endpoint === "https://helium.middleware.tago.io/uplink") return "tago";
  // if (endpoint.indexOf("io.adafruit.com") !== -1) return "adafruit";
  // if (endpoint.indexOf("industrial.ubidots.com") !== -1) return "ubidots";
  // if (endpoint.indexOf("docs.google.com/forms/d/e/") !== -1)
  //   return "googlesheets";
  // if (endpoint.indexOf("microshare.io") !== -1) return "microshare";
  // if (endpoint.indexOf("data-gateway.akenza.io") !== -1) return "akenza";
  return type;
};
