import React from "react";
import { Divider, Typography } from "antd";
const { Text } = Typography;
import { minWidth } from "../../util/constants";

export default ({ mobile }) => (
  <div
    style={
      mobile
        ? { textAlign: "center" }
        : { padding: "60px 30px", minWidth, textAlign: "center" }
    }
  >
    <Text style={{ fontSize: 22, fontWeight: 600 }}>
      The device cap has been met.
    </Text>
    <Divider />
    <Text style={{ fontSize: 18 }}>
      To add more, check other Console Hosting Providers{" "}
      <a href="https://docs.helium.com/use-the-network/console/hosting-providers">
        here
      </a>
      .
    </Text>
  </div>
);
