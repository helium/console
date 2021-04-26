import Azure from '../../img/azure-channel.svg'
import Aws from '../../img/aws-channel.svg'
import Google from '../../img/google-channel.svg'
import Mqtt from '../../img/mqtt-channel.svg'
import Http from '../../img/http-channel.svg'
import Cargo from '../../img/heliumcargo.svg'
import MyDevices from '../../img/mydevices.svg'
import Adafruit from '../../img/adafruitio.png';
import Ubidots from '../../img/ubidots.png';
import Datacake from '../../img/datacake.png';
import Tago from '../../img/tago.png';

export const NEW_CHANNEL_TYPES = [
  {
    name: "HTTP",
    link: "/integrations/new/http",
    img: `${Http}`,
    info: "This integration allows for sending data to an endpoint, as well as receiving data, over HTTP.",
    docLink: 'https://docs.helium.com/use-the-network/console/integrations/http/'
  },
  {
    name: "MQTT",
    link: "/integrations/new/mqtt",
    img: `${Mqtt}`,
    info: "This Integration allows for sending data to an endpoint, as well as receiving data, over the MQTT protocol.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/mqtt" },
  {
    name: "AWS IoT Core",
    link: "/integrations/new/aws",
    img: `${Aws}`,
    info: "This Integration automates the complexity of securely connecting your devices to AWS IoT Core.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/aws-iot-core"
  },
  // { name: "Azure IoT", link: "/integrations/new/azure", img: `${Azure}`, inactive: true },
  // { name: "Google IoT", link: "/integrations/new/google", img: `${Google}`, inactive: true },
]

export const PREMADE_CHANNEL_TYPES = [
  {
    name: "Helium Cargo",
    link: "/integrations/new/cargo",
    img: `${Cargo}`,
    info: "Cargo is an in-house mapping tool used at Helium.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/cargo"
  },
  {
    name: "Google Sheets",
    link: "/integrations/new/googlesheet",
    img: `${Google}` ,
    info: "This Integration streamlines sending data to a Google Sheet by using a Google Form.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/google-sheets"
  },
  {
    name: "myDevices Cayenne",
    link: "/integrations/new/mydevices",
    img: `${MyDevices}`,
    info: "myDevices Cayenne lets you quickly visualize real-time data sent over the Helium Network.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/mydevices-cayenne"
  },
  {
    name: "Ubidots",
    link: "/integrations/new/ubidots",
    img: `${Ubidots}` ,
    info: "Use the Ubidots platform to send data to the cloud from any Internet-enabled device.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/ubidots"
  },
  {
    name: "Adafruit IO",
    link: "/integrations/new/adafruit",
    img: `${Adafruit}` ,
    info: "This Integration automates the complexity of securely connecting your devices to Adafruit IO.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/adafruitio"
  },
  {
    name: "Datacake",
    link: "/integrations/new/datacake",
    img: `${Datacake}` ,
    info: "This Integration simplifies sending data to the Datacake IoT platform.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/datacake"
  },
  {
    name: "TagoIO",
    link: "/integrations/new/tago",
    img: `${Tago}` ,
    info: "This Integration simplifies sending data to the TagoIO platform.",
    docLink: "https://docs.helium.com/use-the-network/console/integrations/tago"
  },
]
