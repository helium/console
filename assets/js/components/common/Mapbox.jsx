import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import mapboxgl from 'mapbox-gl'

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

      if (this.props.location.pathname === "/gateways") {
        this.map.scrollZoom.enable()
      }
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.elements.length !== this.props.elements.length) {
      this.removeGatewaysFromMap()
      this.addGatewaysToMap()
    }
  }

  setMapDefaults() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxsZW5hbiIsImEiOiJjajNtNTF0Z2QwMDBkMzdsNngzbW4wczJkIn0.vLlTjNry3kcFE7zgXeHNzQ'

    let initialCenter = [-93.436, 37.778] //US Center
    let initialZoom = 2
    if (this.props.location.pathname !== "/gateways") {
      initialCenter = [this.props.elements[0].longitude, this.props.elements[0].latitude]
      initialZoom = 14
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

    this.props.elements.forEach(element => {
      features.push({
        "type": "Feature",
        "properties": {
          "description": `<div><p class="blue">${element.name}</p><p>${element.longitude}, ${element.latitude}</p></div>`,
          "id": element.id
        },
        "geometry": {
          "type": "Point",
          "coordinates": [element.longitude, element.latitude]
        }
      })

      this.bounds.extend([element.longitude, element.latitude])
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

    if (this.props.elements.length > 1) {
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

    if (this.props.location.pathname === "/gateways") {
      this.map.on('click', 'innerCircle', (e) => {
        const id = e.features[0].properties.id
        this.props.push(`/gateways/${id}`)
      })
    }
  }

  render() {
    let style
    if (this.props.elements.length == 1) {
      style = {
        width: '100%',
        height: '600px'
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

export default connect(null, mapDispatchToProps)(Mapbox)
