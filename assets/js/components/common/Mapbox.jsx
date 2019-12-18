import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import mapboxgl from 'mapbox-gl'
import { parseLocation } from '../../util/geolocation'

@connect(null, mapDispatchToProps)
class Mapbox extends Component {
  constructor(props) {
    super(props)

    this.setMapDefaults = this.setMapDefaults.bind(this)
    this.addGatewaysToMap = this.addGatewaysToMap.bind(this)
    this.removeGatewaysFromMap = this.removeGatewaysFromMap.bind(this)
    this.addPopupsToMap = this.addPopupsToMap.bind(this)
  }

  componentDidMount() {
    this.setMapDefaults()

    this.map.on('load', () => {
      this.addGatewaysToMap()
      this.addPopupsToMap()

      if (this.props.view === "index") {
        this.map.scrollZoom.enable()
      }
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.gateways.length !== this.props.gateways.length) {
      this.removeGatewaysFromMap()
      this.addGatewaysToMap()
    }
  }

  setMapDefaults() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxsZW5hbiIsImEiOiJjajNtNTF0Z2QwMDBkMzdsNngzbW4wczJkIn0.vLlTjNry3kcFE7zgXeHNzQ'

    let initialCenter = [-93.436, 37.778] //US Center
    let initialZoom = 2
    if (this.props.view === "show") {
      initialCenter = [this.props.gateways[0].longitude, this.props.gateways[0].latitude]
      initialZoom = 13
    }

    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: initialCenter,
      zoom: initialZoom
    })
    this.map.addControl(new mapboxgl.NavigationControl())
    this.map.scrollZoom.disable()
    this.bounds = new mapboxgl.LngLatBounds()
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })
  }

  addGatewaysToMap() {
    let features = []

    this.props.gateways.forEach(gateway => {
      features.push({
        "type": "Feature",
        "properties": {
          "description": `<div><p class="blue">${gateway.name}</p><p>${parseLocation(gateway.location)}</p></div>`,
          "id": gateway.id
        },
        "geometry": {
          "type": "Point",
          "coordinates": [gateway.longitude, gateway.latitude]
        }
      })

      this.bounds.extend([gateway.longitude, gateway.latitude])
    })

    this.map.addLayer({
      "id": "outerCircle",
      "type": "circle",
      "source": {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": features
        }
      },
      'paint': {
        'circle-color': '#2196F3',
        'circle-opacity': 0.4,
        'circle-radius': {
          type: 'exponential',
          stops: [
            [0, 10], [10,16], [12, 20], [14, 150], [22,3000]
          ]
        }
      }
    })

    this.map.addLayer({
      "id": "innerCircle",
      "type": "circle",
      "source": {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": features
        }
      },
      'paint': {
        'circle-color': '#E3F2FD',
        'circle-radius': {
          type: 'exponential',
          stops: [
            [0, 5], [10,8], [12, 10], [14, 15], [22,20]
          ]
        }
      }
    })

    if (this.props.gateways.length > 1) {
      this.map.fitBounds(this.bounds, {
        padding: {top: 100, bottom: 100, left: 100, right: 100}
      })
    }
  }

  removeGatewaysFromMap() {
    this.map.removeLayer("innerCircle")
    this.map.removeLayer("outerCircle")
    this.map.removeSource("innerCircle")
    this.map.removeSource("outerCircle")
  }

  addPopupsToMap() {
    this.map.on('mouseenter', 'innerCircle', (e) => {
      this.map.getCanvas().style.cursor = 'pointer'

      var coordinates = e.features[0].geometry.coordinates.slice()
      var description = e.features[0].properties.description

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      this.popup.setLngLat(coordinates)
        .setHTML(description)
        .addTo(this.map)
    })

    this.map.on('mouseleave', 'innerCircle', () => {
      this.map.getCanvas().style.cursor = ''
      this.popup.remove()
    })

    if (this.props.view === "index") {
      this.map.on('click', 'innerCircle', (e) => {
        const id = e.features[0].properties.id
        this.props.push(`/gateways/${id}`)
      })
    }
  }

  render() {
    let style
    if (this.props.view == "show") {
      style = {
        width: '100%',
        height: '280px'
      }
    } else {
      style = {
        width: 'calc(100% - 240px)',
        height: 'calc(100% - 160px)',
        position: 'absolute'
      }
    }

    return <div style={style} ref={el => this.mapContainer = el} />
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default Mapbox
