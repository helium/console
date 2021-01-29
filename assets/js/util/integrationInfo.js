import Azure from '../../img/azure-channel.svg'
import Aws from '../../img/aws-channel.svg'
import Google from '../../img/google-channel.svg'
import Mqtt from '../../img/mqtt-channel.svg'
import Http from '../../img/http-channel.svg'
import Cargo from '../../img/heliumcargo.svg'
import MyDevices from '../../img/mydevices.svg'
import Adafruit from '../../img/adafruitio.png';
import Ubidots from '../../img/ubidots.svg';

export const NEW_CHANNEL_TYPES = [
  {
    name: "HTTP",
    link: "/integrations/new/http",
    img: `${Http}`,
    info: "This integration allows for sending data to an endpoint, as well as receiving data, over HTTP.",
    docLink: 'https://developer.helium.com/console/integrations/http'
  },
  {
    name: "MQTT",
    link: "/integrations/new/mqtt",
    img: `${Mqtt}`,
    info: "This Integration allows for sending data to an endpoint, as well as receiving data, over the MQTT protocol.",
    docLink: "https://developer.helium.com/console/integrations/mqtt" },
  {
    name: "AWS IoT Core",
    link: "/integrations/new/aws",
    img: `${Aws}`,
    info: "This Integration automates the complexity of securely connecting your devices to AWS IoT Core.",
    docLink: "https://developer.helium.com/console/integrations/awsiotcore"
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
    docLink: "https://developer.helium.com/console/integrations/cargo"
  },
  {
    name: "myDevices Cayenne",
    link: "/integrations/new/mydevices",
    img: `${MyDevices}`,
    info: "myDevices Cayenne lets you quickly visualize real-time data sent over the Helium Network.",
    docLink: "https://developer.helium.com/console/integrations/mydevices-cayenne-integration"
  },
  {
    name: "Ubidots",
    link: "/integrations/new/ubidots",
    img: `${Ubidots}` ,
    info: "Use the Ubidots platform to send data to the cloud from any Internet-enabled device.",
    docLink: "https://developer.helium.com/console/integrations/ubidots"
  },
  {
    name: "Adafruit IO",
    link: "/integrations/new/adafruit",
    img: `${Adafruit}` ,
    info: "This Integration automates the complexity of securely connecting your devices to Adafruit IO.",
    docLink: "https://developer.helium.com/console/integrations/adafruitio"
  },
]
