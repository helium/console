import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLazyQuery } from "@apollo/client";
import { Typography, Row, Col, Button } from "antd";
const { Text } = Typography;
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { HOTSPOT_SHOW } from "../../graphql/coverage";
import startCase from "lodash/startCase";
import { renderStatusLabel } from './Constants'
import { updateOrganizationHotspot } from '../../actions/coverage'
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import LocationIcon from "../../../img/coverage/hotspot-show-location-icon.svg";
import AliasIcon from "../../../img/coverage/hotspot-show-alias-icon.svg";

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
            <Col sm={20}>
              <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: 600, marginRight: 20 }}>{startCase(data.hotspot.hotspot_name)}</Text>
                {renderStatusLabel(data.hotspot.status)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#2C79EE', marginRight: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <img
                    draggable="false"
                    src={LocationIcon}
                    style={{ height: 12, marginRight: 4 }}
                  />
                  {locationString(data.hotspot.long_city, data.hotspot.short_state, data.hotspot.short_country)}
                </span>
                <span style={{ color: '#2C79EE', marginRight: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <img
                    draggable="false"
                    src={AliasIcon}
                    style={{ height: 12, marginRight: 4 }}
                  />
                  Alias
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 15 }}>
                  This Hotspot has heard from of your devices over the past 30 days.
                </Text>
              </div>
            </Col>
            <Col sm={4}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Link
                    to="#"
                    onClick={() =>
                      updateOrganizationHotspot(
                        data.hotspot.hotspot_address,
                        !props.orgHotspotsMap[data.hotspot.hotspot_address]
                      )
                    }
                  >
                    <img
                      draggable="false"
                      src={props.orgHotspotsMap[data.hotspot.hotspot_address] ? SelectedFlag : UnselectedFlag}
                      style={{
                        height: 20,
                        marginBottom: 8
                      }}
                    />
                  </Link>
                  <div style={{ backgroundColor: '#F5F7F9', borderRadius: 10, padding: '4px 8px 4px 8px' }}>
                    <Text
                      style={{ fontSize: 16, color: '#2C79EE'}}
                    >
                      {props.orgHotspotsMap[data.hotspot.hotspot_address] ? "Claimed!" : "Unclaimed"}
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
