import React, { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { Typography, Row, Col, Button } from "antd";
const { Text } = Typography;
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { HOTSPOT_SHOW } from "../../graphql/coverage";
import startCase from "lodash/startCase";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";

export default (props) => {
  const [getHotspot, { error, loading, data, refetch }] = useLazyQuery(HOTSPOT_SHOW);

  useEffect(() => {
    getHotspot({
      fetchPolicy: "cache-and-network",
      variables: { address: props.hotspotAddress }
    })
  }, [props.hotspotAddress]);

  return (
    <div style={{ padding: 25, paddingTop: 8 }}>
      <Button
        icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
        style={{ border: "none", padding: 0, fontSize: 14, color: '#bfbfbf', height: 24 }}
        onClick={() => props.selectHotspotAddress(null)}
      >
        Back
      </Button>
      {
        data && data.hotspot && (
          <Row gutter={12}>
            <Col sm={18}>
              <div style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 22, fontWeight: 600 }}>{startCase(data.hotspot.hotspot_name)}</Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#2C79EE'}}>{locationString(data.hotspot.long_city, data.hotspot.short_state, data.hotspot.short_country)}</span>
                <span style={{ color: '#2C79EE'}}>alias</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 15 }}>
                  This Hotspot has heard from of your devices over the past 30 days.
                </Text>
              </div>
            </Col>
            <Col sm={6}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    draggable="false"
                    src={SelectedFlag}
                    style={{
                      height: 20,
                      marginBottom: 8
                    }}
                  />
                  <div style={{ backgroundColor: '#F5F7F9', borderRadius: 10, padding: '4px 8px 4px 8px' }}>
                    <Text
                      style={{ fontSize: 16, color: '#2C79EE'}}
                    >
                      Claimed!
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        )
      }

    </div>
  );
};

const locationString = (long_city, short_state, short_country) => {
  if (long_city && short_country && short_state) {
    return long_city + ", " + short_state + ", " + short_country;
  }
  if (!long_city && short_country) {
    return short_country;
  }
  return "Unknown Location";
}
