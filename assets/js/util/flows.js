import AdafruitIcon from "../../img/channels/adafruit.png";
import AwsIcon from "../../img/channels/aws.png";
import AzureIcon from "../../img/channels/azure.png";
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

export const integrationImgMap = {
  adafruit: AdafruitIcon,
  aws: AwsIcon,
  azure: AzureIcon,
  cargo: CargoIcon,
  cayenne: CayenneIcon,
  datacake: DatacakeIcon,
  http: HttpIcon,
  mqtt: MqttIcon,
  tago: TagoIcon,
  ubidots: UbidotsIcon,
  googlesheets: GoogleSheetIcon,
  microshare: MicroshareIcon,
  akenza: AkenzaIcon,
};

export const getIntegrationTypeForFlows = (endpoint, type) => {
  if (!endpoint) return type;
  if (endpoint === "https://cargo.helium.com/api/payloads") return "cargo";
  if (endpoint === "https://lora.mydevices.com/v1/networks/helium/uplink")
    return "cayenne";
  if (endpoint === "https://api.datacake.co/integrations/lorawan/helium/")
    return "datacake";
  if (endpoint === "https://helium.middleware.tago.io/uplink") return "tago";
  if (endpoint.indexOf("io.adafruit.com") !== -1) return "adafruit";
  if (endpoint.indexOf("industrial.ubidots.com") !== -1) return "ubidots";
  if (endpoint.indexOf("docs.google.com/forms/d/e/") !== -1)
    return "googlesheets";
  if (endpoint.indexOf("microshare.io") !== -1) return "microshare";
  if (endpoint.indexOf("data-gateway.akenza.io" !== -1)) return "akenza";
  return type;
};
