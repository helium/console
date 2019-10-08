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

  updateChart(events) {
    const success = []
    const failure = []
    events.forEach(event => {
      const currentTime = Date.now() / 1000
      const eventTime =  event.delivered_at
      const timeDiff = currentTime - eventTime
      if ( timeDiff < 300 ) {
        if (event.status == 'success') {
          success.push({
            x: timeDiff,
            y: parseFloat(event.rssi),
            r: event.payload_size / 2
          })
        } else if (event.status == 'failure') {
          failure.push({
            x: timeDiff,
            y: parseFloat(event.rssi),
            r: event.payload_size / 2
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
            label: 'Failure',
            data: failure,
            backgroundColor: 'rgba(255, 165, 0, 0.5)'
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
