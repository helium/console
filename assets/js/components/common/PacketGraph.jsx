import React, { Component } from 'react'
import { Bubble } from 'react-chartjs-2'

class PacketGraph extends Component {
  constructor(props) {
    super(props)

    this.chartUpdateInterval = null
    this.chartOptions = {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      layout: {
          padding: {
              left: 0,
              right: 10,
              top: 30,
              bottom: 0
          }
      },
      scales: {
        yAxes: [{
          id: 'RSSI-axis',
          type: 'linear',
          position: 'left',
          offset: true,
          ticks: {
            beginAtZero: true,
            min: -120,
            max: 0
          },
          scaleLabel: {
            display: true,
            labelString: 'RSSI'
          }
        }],
        xAxes: [{
          id: 'Time-axis',
          type: 'linear',
          position: 'bottom',
          gridLines: {
            display: false
          },
          ticks: {
            beginAtZero: true,
            min: 0,
            max: 300,
            stepSize: 30,
            callback: (value) => {
              if (value !== 0) return '-' + value + 's';
              else return value + 's'
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Time Past in Seconds'
          }
        }]
      },
      legend: {
        display: false,
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          label: (tooltip, data) => {
            return (data.datasets[tooltip.datasetIndex].data[tooltip.index].r - 2) * 4
              + 'byte packet received by '
              + data.datasets[tooltip.datasetIndex].data[tooltip.index].h
          }
        }
      }
    }

    this.state = {
      data: {
        datasets: []
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { events } = this.props

    if (prevProps.events.length !== events.length) {
      clearInterval(this.chartUpdateInterval)
      this.updateChart(events)
      this.chartUpdateInterval = setInterval(() => {
        this.updateChart(events)
      }, 5000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.chartUpdateInterval)
  }

  updateChart = (events) => {
    const success = []
    const error = []
    const noIntegration = []

    events.forEach(event => {
      const currentTime = Date.now() / 1000
      const eventTime =  parseInt(event.reported_at) / 1000
      const timeDiff = currentTime - eventTime
      const integrations = event.integrations
      const hotspots = event.hotspots

      if (timeDiff < 300) {
        if (integrations[0] && integrations[0].status == 'success') {
          success.push({
            x: timeDiff,
            y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
            r: event.payload_size / 4 + 2,
            h: hotspots[0] ? hotspots[0].name : "unknown"
          })
        } else if (integrations[0] && integrations[0].status == 'error') {
          error.push({
            x: timeDiff,
            y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
            r: event.payload_size / 4 + 2,
            h: hotspots[0] ? hotspots[0].name : "unknown"
          })
        } else {
          noIntegration.push({
            x: timeDiff,
            y: parseFloat(hotspots[0] ? hotspots[0].rssi : 0),
            r: event.payload_size / 4 + 2,
            h: hotspots[0] ? hotspots[0].name : "unknown"
          })
        }
      }
    })

    this.setState({
      data: {
        datasets: [
          {
            label: 'Success',
            data: success,
            backgroundColor: 'rgba(33, 150, 243, 0.5)'
          },
          {
            label: 'Error',
            data: error,
            backgroundColor: 'rgba(255, 165, 0, 0.5)'
          },
          {
            label: 'No Channel',
            data: noIntegration,
            backgroundColor: 'rgba(255, 0, 0, 0.5)'
          },
        ]
      }
    })
  }

  render() {
    return <Bubble data={this.state.data} options={this.chartOptions}/>
  }
}

export default PacketGraph
