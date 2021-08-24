import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OutsideClick from "react-outside-click-handler";
import { useLazyQuery } from "@apollo/client";
import { Typography, Row, Col, Button, Tooltip, Input } from "antd";
const { Text } = Typography;
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { HOTSPOT_SHOW } from "../../graphql/coverage";
import startCase from "lodash/startCase";
import { renderStatusLabel } from './Constants'
import { updateOrganizationHotspot, updateHotspotAlias } from '../../actions/coverage'
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import LocationIcon from "../../../img/coverage/hotspot-show-location-icon.svg";
import AliasIcon from "../../../img/coverage/hotspot-show-alias-icon.svg";

export default (props) => {
  const [getHotspot, { error, loading, data, refetch }] = useLazyQuery(HOTSPOT_SHOW);
  const [name, setName] = useState("");
  const [showAliasInput, toggleAliasInput] = useState(false);

  useEffect(() => {
    getHotspot({
      fetchPolicy: "cache-and-network",
      variables: { address: props.hotspotAddress }
    })
  }, [props.hotspotAddress]);

  if (error || loading || !data) return (
    <div style={{ padding: 25, paddingTop: 8 }} />
  )

  const hotspot = data.hotspot
  const orgHotspot = props.orgHotspotsMap[hotspot.hotspot_address]
  const hotspotClaimed = orgHotspot ? orgHotspot.claimed : false
  const hotspotAlias = orgHotspot ? orgHotspot.alias : null

  return (
    <div style={{ padding: 25, paddingTop: 8 }}>
      <Button
        icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
        style={{ border: "none", padding: 0, fontSize: 14, color: '#bfbfbf', height: 24 }}
        onClick={() => props.selectHotspotAddress(null)}
      >
        Back
      </Button>

      <Row gutter={12}>
        <Col sm={20}>
          <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: 600, marginRight: 20 }}>{startCase(hotspot.hotspot_name)}</Text>
            {renderStatusLabel(hotspot.status)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#2C79EE', marginRight: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <img
                draggable="false"
                src={LocationIcon}
                style={{ height: 12, marginRight: 4 }}
              />
              {locationString(hotspot.long_city, hotspot.short_state, hotspot.short_country)}
            </span>
            {
              showAliasInput ? (
                <OutsideClick
                  onOutsideClick={() => {
                    toggleAliasInput(false)
                    updateHotspotAlias(hotspot.hotspot_address, name)
                  }}
                >
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: 200,
                      verticalAlign: "middle",
                    }}
                    suffix={`${name.length}/50`}
                    maxLength={50}
                  />
                </OutsideClick>
              ) : (
                <Link
                  to="#"
                  onClick={e => {
                    e.preventDefault()
                    toggleAliasInput(true)
                    setName(hotspotAlias || "")
                  }}
                >
                  <span style={{ color: '#2C79EE', marginRight: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img
                      draggable="false"
                      src={AliasIcon}
                      style={{ height: 12, marginRight: 4 }}
                    />
                    <Tooltip title="Click to Edit Alias">
                      {hotspotAlias || "No Alias"}
                    </Tooltip>
                  </span>
                </Link>
              )
            }
          </div>
          <div style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16 }}>
              This Hotspot has heard from none of your devices over the past 24 hours.
            </Text>
          </div>
        </Col>
        <Col sm={4}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Link
                to="#"
                onClick={() => {
                  updateOrganizationHotspot(hotspot.hotspot_address, !hotspotClaimed)
                }}
              >
                <img
                  draggable="false"
                  src={hotspotClaimed ? SelectedFlag : UnselectedFlag}
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
                  {hotspotClaimed ? "Claimed!" : "Unclaimed"}
                </Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
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
