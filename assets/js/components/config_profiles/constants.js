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
  "- Enabled, the server will send a CF List with every other join.";

export const cfListText3 =
  "- Disabled, the server will not send a CF List. The channel mask is still transmitted via ADR command.";
