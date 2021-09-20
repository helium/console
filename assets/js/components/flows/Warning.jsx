import React from "react";
import Text from "antd/lib/typography/Text";
import Warning from "../../../img/node-warning.svg";

export default ({ numberWarnings }) => {
  return (
    <div>
      <img src={Warning} style={{ height: 16 }} />
      <Text style={{ marginLeft: 4, fontSize: 16, color: "#F18F47" }}>
        {numberWarnings} Warning{numberWarnings > 1 ? "s" : ""}
      </Text>
    </div>
  );
};
