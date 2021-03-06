import React, { Component } from "react";
import { Bubble } from "react-chartjs-2";

const categoryTag = (category, subCategories) => {
  switch (category) {
    case "uplink_dropped":
      return "Uplink Dropped"
    case "uplink":
      return "Uplink"
    case "downlink_dropped":
      return "Downlink Dropped"
    case "downlink":
      if (subCategories.includes("downlink_queued")) {
        return "Downlink Queued"
      } else if (subCategories.includes("downlink_ack")) {
        return "Acknowledge"
      } else {
        return "Downlink"
      }
    case "join_request":
      return "Join Request"
    case "join_accept":
      return "Join Accept"
    case "misc":
      return "Misc. Integration Error"
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
      scales: {
        yAxes: [
          {
            id: "RSSI-axis",
            type: "linear",
            position: "left",
            offset: true,
            ticks: {
              beginAtZero: true,
              min: -120,
              max: 0,
            },
            scaleLabel: {
              display: true,
              labelString: "RSSI",
            },
          },
        ],
        xAxes: [
          {
            id: "Time-axis",
            type: "linear",
            position: "bottom",
            gridLines: {
              display: false,
            },
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 300000,
              stepSize: 30000,
              callback: (value) => {
                if (value !== 0) return "-" + parseInt(value) / 1000 + "s";
                else return value + "s";
              },
            },
            scaleLabel: {
              display: true,
              labelString: "Time Past in Seconds",
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (tooltip, data) => {
            return (
              data.datasets[tooltip.datasetIndex].data[tooltip.index].tag +
              " (" +
              (data.datasets[tooltip.datasetIndex].data[tooltip.index].r - 2) * 4 +
              " bytes) by " +
              data.datasets[tooltip.datasetIndex].data[tooltip.index].h
            );
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
      (prevProps.events[0] && this.props.events[0] && prevProps.events[0].integrations.length !== this.props.events[0].integrations.length)
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
      const tag = categoryTag(event.category, event.sub_categories)

      if (timeDiff < 300000) {
        if (integrations.length > 0 && integrations[0].id !== "no_channel") {
          if (integrations.findIndex((i) => i.status === "error") !== -1) {
            error.push({
              x: timeDiff,
              y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
              r: event.payload_size / 4 + 2,
              h: hotspots[0] ? hotspots[0].name : "unknown",
              tag
            });
          } else {
            success.push({
              x: timeDiff,
              y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
              r: event.payload_size / 4 + 2,
              h: hotspots[0] ? hotspots[0].name : "unknown",
              tag
            });
          }
        } else {
          noIntegration.push({
            x: timeDiff,
            y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
            r: event.payload_size / 4 + 2,
            h: hotspots[0] ? hotspots[0].name : "unknown",
            tag
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
    return <Bubble data={this.state.data} options={this.chartOptions} />;
  }
}

export default PacketGraph;
