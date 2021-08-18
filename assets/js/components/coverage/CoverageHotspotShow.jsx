import React, { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Typography, Row, Col } from "antd";
const { Text } = Typography;
import { HOTSPOT_SHOW } from "../../graphql/coverage";

export default (props) => {
  const [getHotspot, { error, loading, data, refetch }] = useLazyQuery(HOTSPOT_SHOW);

  useEffect(() => {
    getHotspot({
      fetchPolicy: "cache-and-network",
      variables: { address: props.hotspotAddress }
    })
  }, [props.hotspotAddress]);

  return (
    <div style={{ padding: 25}}>
      <div style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>{props.hotspotAddress}</Text>
      </div>


    </div>
  );
};
