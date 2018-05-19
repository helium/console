import React, { Component } from 'react'
import { Bubble } from 'react-chartjs-2'

class PacketGraph extends Component {
  constructor(props) {
    super(props)

    this.updateChart = this.updateChart.bind(this)
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
            min: 0,
            max: 100
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
            return data.datasets[tooltip.datasetIndex].label + ' '
              + data.datasets[tooltip.datasetIndex].data[tooltip.index].r * 2
              + ' Kb packet '
              + Math.floor(data.datasets[tooltip.datasetIndex].data[tooltip.index].x)
              + ' seconds ago'
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

  componentDidUpdate(prevProps) { // change to getDerivedStateFromProps when we update react to 16.3+
    if (!this.props.data || !prevProps.data) return

    if (
      (this.props.data[0] && !prevProps.data[0]) ||
      (this.props.data[0] && this.state.data.datasets.length == 0) ||
      (this.props.data[0] && prevProps.data[0] && this.props.data[this.props.data.length-1].id !== prevProps.data[prevProps.data.length-1].id)
    ) {
      clearInterval(this.chartUpdateInterval)
      this.updateChart(this.props.data)
      this.chartUpdateInterval = setInterval(() => {
        this.updateChart(this.props.data)
      }, 5000)
    }
  }

  componentWillUnmount() {
    clearInterval(this.chartUpdateInterval)
  }

  updateChart(events) {
    const inbound = []
    const outbound = []
    events.forEach(event => {
      const currentTime = Date.now() / 1000
      const eventTime =  Date.parse(event.reported_at + 'Z') / 1000 //fix time issue here appending Z when backend is fixed
      const timeDiff = currentTime - eventTime
      if ( timeDiff < 300 ) {
        if (event.direction == 'inbound') {
          inbound.push({
            x: timeDiff,
            y: event.rssi,
            r: event.payload_size / 2
          })
        } else if (event.direction == 'outbound') {
          outbound.push({
            x: timeDiff,
            y: event.rssi,
            r: event.payload_size / 2
          })
        }
      }
    })

    this.setState({
      data: {
        datasets: [
          {
            label: 'Inbound',
            data: inbound,
            backgroundColor: 'rgba(33, 150, 243, 0.5)'
          },
          {
            label: 'Outbound',
            data: outbound,
            backgroundColor: 'rgba(105, 240, 174, 0.6)'
          }
        ]
      }
    })
  }

  render() {
    return <Bubble data={this.state.data} options={this.chartOptions}/>
  }
}

export default PacketGraph
