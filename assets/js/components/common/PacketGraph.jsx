import React, { Component } from "react";
import Chart from "chart.js/auto";
import { Bubble } from "react-chartjs-2";

const categoryTag = (category, subCategories) => {
  switch (category) {
    case "uplink_dropped":
      return "Uplink Dropped";
    case "uplink":
      return "Uplink";
    case "downlink_dropped":
      return "Downlink Dropped";
    case "downlink":
      if (subCategories.includes("downlink_queued")) {
        return "Downlink Queued";
      } else if (subCategories.includes("downlink_ack")) {
        return "Acknowledge";
      } else {
        return "Downlink";
      }
    case "join_request":
      return "Join Request";
    case "join_accept":
      return "Join Accept";
    case "misc":
      return "Misc. Integration Error";
  }
};

class PacketGraph extends Component {
  constructor(props) {
    super(props);

    this.chartUpdateInterval = null;
    this.chartOptions = {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 10,
          top: 30,
          bottom: 0,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (tooltip) => {
              return (
                tooltip.raw.tag +
                " (" +
                (tooltip.raw.r - 2) * 4 +
                " bytes) by " +
                tooltip.raw.h
              );
            },
          },
        },
      },
      scales: {
        y: {
          title: {
            text: "RSSI",
            display: true,
          },
          min: -120,
          max: 20,
        },
        x: {
          title: {
            text: "Time Passed in Seconds",
            display: true,
          },
          min: 0,
          max: 300,
          grid: {
            display: false,
          },
          ticks: {
            callback: (value) => {
              if (value !== 0) return "-" + parseInt(value) + "s";
              else return value + "s";
            },
          },
        },
      },
    };

    this.state = {
      data: {
        datasets: [],
      },
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.events.length !== this.props.events.length ||
      (prevProps.events[0] &&
        this.props.events[0] &&
        prevProps.events[0].integrations.length !==
          this.props.events[0].integrations.length)
    ) {
      clearInterval(this.chartUpdateInterval);
      this.updateChart();
      this.chartUpdateInterval = setInterval(() => {
        this.updateChart();
      }, 5000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.chartUpdateInterval);
  }

  updateChart = () => {
    const success = [];
    const error = [];
    const noIntegration = [];

    this.props.events.forEach((event) => {
      const currentTime = Date.now();
      const eventTime = parseInt(event.reported_at);
      const timeDiff = currentTime - eventTime;
      const integrations = event.integrations;
      const hotspots = event.hotspots;
      const tag = categoryTag(event.category, event.sub_categories);

      if (timeDiff < 300000) {
        if (integrations.length > 0 && integrations[0].id !== "no_channel") {
          if (integrations.findIndex((i) => i.status === "error") !== -1) {
            error.push({
              x: timeDiff / 1000,
              y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
              r: event.payload_size / 4 + 2,
              h: hotspots[0] ? hotspots[0].name : "unknown",
              tag,
            });
          } else {
            success.push({
              x: timeDiff / 1000,
              y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
              r: event.payload_size / 4 + 2,
              h: hotspots[0] ? hotspots[0].name : "unknown",
              tag,
            });
          }
        } else {
          noIntegration.push({
            x: timeDiff / 1000,
            y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
            r: event.payload_size / 4 + 2,
            h: hotspots[0] ? hotspots[0].name : "unknown",
            tag,
          });
        }
      }
    });

    this.setState({
      data: {
        datasets: [
          {
            label: "Success",
            data: success,
            backgroundColor: "rgba(33, 150, 243, 0.5)",
          },
          {
            label: "Error",
            data: error,
            backgroundColor: "rgba(255, 165, 0, 0.5)",
          },
          {
            label: "No Channel",
            data: noIntegration,
            backgroundColor: "rgba(255, 0, 0, 0.5)",
          },
        ],
      },
    });
  };

  render() {
    return (
      <Bubble
        id="packet-graph"
        data={this.state.data}
        options={this.chartOptions}
      />
    );
  }
}

export default PacketGraph;
