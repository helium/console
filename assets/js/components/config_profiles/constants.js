export const adrText1 =
  "ADR allows devices to use an optimal data rate which reduces power consumption and airtime on the network based on RF conditions. When ADR is disabled the channel mask is still transmitted via ADR command, but power output and data rates are not impacted. ";
export const adrText2 =
  "Recommended: only use ADR for fixed or non-mobile devices to ensure reliable connectivity.";

export const cfListText1 = `
  The Join-Accept CF List configures channels according to
  the LoRaWAN spec to use sub-band 2. Devices that have not correctly implemented the
  LoRaWAN spec may experience transfer issues when this setting is enabled.
`;

export const cfListText2 =
  "- Enabled, the server will include the CFList with join accept. The channel mask is also transmitted via ADR command.";

export const cfListText3 =
  "- Disabled, the server will not include CFList with join accepts. The channel mask is only transmitted via ADR command.";

export const rxDelayText1 = `
  Specify the number of seconds the device's first receive window begins after the transmit ends.
`;

export const rxDelayText2 =
  "A higher number increases the receive delay window and generally can increase downlink reliability as higher latencies between the LoRaWAN gateway and network server will be tolerated.";

export const rxDelayText3 =
  "However, devices that suffer from drift may not work as well and a longer delay reduces the theoretical maximum rate of communication since a subsequent transmit may only be accomplished after both receive windows. Note: The second receive window always begins one second after the first.";
