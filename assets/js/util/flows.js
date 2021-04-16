export const getIntegrationTypeForFlows = (endpoint, type) => {
  if (!endpoint) return type
  if (endpoint === "https://cargo.helium.com/api/payloads") return "cargo"
  if (endpoint === "https://lora.mydevices.com/v1/networks/helium/uplink") return "cayenne"
  if (endpoint === "https://api.datacake.co/integrations/lorawan/helium/") return "datacake"
  if (endpoint === "https://helium.middleware.tago.io/uplink") return "tago"
  if (endpoint.indexOf("io.adafruit.com") !== -1) return "adafruit"
  if (endpoint.indexOf("industrial.ubidots.com") !== -1) return "ubidots"
  return type
}
