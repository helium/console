import React, { useEffect } from "react";
import numeral from "numeral";
import { useQuery } from "@apollo/client";
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';
import range from 'lodash/range'
import analyticsLogger from "../../util/analyticsLogger";
import { HOTSPOT_SHOW_PACKETS } from "../../graphql/coverage";
import { Typography, Row, Col } from "antd";
import { Link } from "react-router-dom";
const { Text } = Typography;

const styles = {
  container: {
    backgroundColor: '#F5F7F9',
    borderRadius: 6,
    padding: '8px 16px 8px 16px',
    overflow: 'hidden',
    height: '100%'
  }
}

const chartOptions = {
  layout: {
    padding: 12
  },
  borderRadius: 100,
  borderSkipped: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      titleFont: {
        size: 12, weight: 400
      },
      titleMarginBottom: 0,
      bodyFont: {
        size: 12, weight: 300
      },
      footerMarginTop: 10,
      footerFont: {
        size: 10, weight: 400
      },
      footerColor: '#909090',
      displayColors: false,
      callbacks: {
        title: (tooltip) => {
          if (tooltip[0].raw == 0.5) return '0 Packets'
          else return `${tooltip[0].raw} Packets`
        },
        label: (tooltip) => {
          return `${tooltip.label} Devices`
        },
        footer: (tooltip) => {
          return `${24 - tooltip[0].dataIndex} ${24 - tooltip[0].dataIndex === 1 ? "Hour" : "Hours"} Ago`
        },
      },
    },
  },
  scales: {
    xAxis: {
      display: true,
      title: {
        display: true,
        text: 'Time Ago in Hours'
      },
      ticks: {
        display: true,
        callback: (value, index, values) => {
          const list = [24, 12, 6, 3, 1]
          if (list.includes(24 - index)) return 24 - index
          return ""
        }
      },
      grid: {
        display: false
      }
    },
    yAxis: {
      display: true,
      title: {
        display: true,
        text: '# of Packets'
      },
      ticks: {
        display: false
      },
      grid: {
        display: false
      }
    }
  },
  maintainAspectRatio: false,
};

export default (props) => {
  const {
    loading: showPacketsLoading,
    error: showPacketsError,
    data: showPacketsData,
    refetch: showPacketsRefetch,
  } = useQuery(HOTSPOT_SHOW_PACKETS, {
    fetchPolicy: "cache-and-network",
    variables: { address: props.hotspot.hotspot_address }
  });

  useEffect(() => {
    // executed when mounted
    analyticsLogger.logEvent("ACTION_NAV_COVERAGE_SHOW_STATS", { address: props.hotspot.hotspot_address });
  }, []);

  const renderDiffPacketCount = (hotspot) => {
    const positive = hotspot.packet_count - hotspot.packet_count_2d >= 0;
    return (
      <Text style={{ fontSize: 18, color: positive ? "#12CB9E" : "#F15B47" }}>
        {hotspot.packet_count_2d !== 0 &&
          `${positive ? "+" : ""}${(
            ((hotspot.packet_count - hotspot.packet_count_2d) /
              hotspot.packet_count_2d) *
            100
          ).toFixed(2)}%`}
      </Text>
    )
  }

  const renderDiffDeviceCount = (hotspot) => {
    const positive = hotspot.device_count - hotspot.device_count_2d >= 0;
    return (
      <Text style={{ fontSize: 18, color: positive ? "#12CB9E" : "#F15B47" }}>
        {hotspot.device_count_2d !== 0 &&
          `${positive ? "+" : ""}${(
            ((hotspot.device_count - hotspot.device_count_2d) /
              hotspot.device_count_2d) *
            100
          ).toFixed(2)}%`}
      </Text>
    )
  }

  const renderChart = () => {
    if (showPacketsData) {
      const packetsMap = showPacketsData.hotspotPackets.reduce((acc, packet) => {
        const key = Math.ceil((Date.now() - packet.reported_at_epoch) / 1000 / 3600)
        if (acc[key]) {
          if (acc[key][packet.device_id]) {
            return Object.assign({}, acc, { [key]: Object.assign({}, acc[key], { [packet.device_id]: acc[key][packet.device_id] + 1 }) })
          } else {
            return Object.assign({}, acc, { [key]: Object.assign({}, acc[key], { [packet.device_id]: 1 }) })
          }
        } else {
          return Object.assign({}, acc, { [key]: { [packet.device_id]: 1 } })
        }
      }, {})

      const data = range(24, 0).map(index => {
        if (packetsMap[index]) {
          return Object.values(packetsMap[index]).reduce((a,b) => a + b)
        }
        return 0.5
      })

      const labels = range(24, 0).map(index => {
        if (packetsMap[index]) {
          return Object.keys(packetsMap[index]).length
        }
        return 0
      })

      const backgroundColor = data.map(val => {
        if (val == 0.5) return '#ACB9CD'
        else return '#2C79EE'
      })

      const chartData = {
        labels,
        datasets: [
          {
            data,
            backgroundColor
          },
        ],
      };

      return <Bar id="hotspot-show-bar-chart" data={chartData} options={chartOptions} />
    }
    return <div />
  }

  return (
    <div style={{ padding: 25, paddingTop: 0 }}>
      <div>
        <Text style={{ fontSize: 14, fontWeight: 600, display: 'block' }}>Packets Relayed</Text>
        <Text style={{ fontSize: 12, display: 'block', color: '#2C79EE', position: 'relative', top: -4 }}>From Devices in your organization</Text>
      </div>
      {renderChart()}
      <Row gutter={12}>
        <Col sm={8}>
          <div
            style={styles.container}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Most Heard Device</Text>
            <Text style={{ fontSize: 24, display: 'block', fontWeight: 500 }}>
              {
                props.hotspot.most_heard_device_name ? (
                  <Link
                    to={`/devices/${props.hotspot.most_heard_device_id}`}
                    style={{ color: '#2C79EE' }}
                  >
                    {props.hotspot.most_heard_device_name}
                  </Link>
                ) : (
                  "None"
                )
              }
            </Text>
            <Text style={{ fontSize: 18, color: '#2C79EE', display: 'block' }}>
              {props.hotspot.most_heard_packet_count !== 0 ? `${numeral(props.hotspot.most_heard_packet_count).format("0,0")} packets` : ""}
            </Text>
          </div>
        </Col>
        <Col sm={8}>
          <div
            style={styles.container}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Total Packets</Text>
            <Text style={{ fontSize: 24, fontWeight: 500, marginRight: 8 }}>{numeral(props.hotspot.packet_count).format("0,0")}</Text>
            {renderDiffPacketCount(props.hotspot)}
          </div>
        </Col>
        <Col sm={8}>
          <div
            style={styles.container}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Number of Devices</Text>
            <Text style={{ fontSize: 24, fontWeight: 500, marginRight: 8 }}>{numeral(props.hotspot.device_count).format("0,0")}</Text>
            {renderDiffDeviceCount(props.hotspot)}
          </div>
        </Col>
      </Row>
    </div>
  );
};
