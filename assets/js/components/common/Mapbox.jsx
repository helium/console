import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import mapboxgl from 'mapbox-gl'

class Mapbox extends Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxsZW5hbiIsImEiOiJjajNtNTF0Z2QwMDBkMzdsNngzbW4wczJkIn0.vLlTjNry3kcFE7zgXeHNzQ'

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/light-v9'
    });

    map.on('load', () => {
      this.props.elements.forEach(element => {
        const el = document.createElement('div')

        const innerCircle = document.createElement('div')
          innerCircle.className = 'inner'
          el.appendChild(innerCircle)

        const outerCircle = document.createElement('div');
          outerCircle.className = 'outer';
          el.appendChild(outerCircle);

        const popover = document.createElement('div');
          el.appendChild(popover);

        el.addEventListener("mouseover", () => {
          popover.className = "popover"
          popover.innerHTML = element.name
        })
        el.addEventListener("mouseout", () => {
          popover.className = ""
          popover.innerHTML = ""
        })

        el.addEventListener("click", (e) => {
          e.preventDefault()
          this.props.push("/devices/" + element.id)
        })

        const marker = new mapboxgl.Marker(el)
          .setLngLat([Math.random() * 50, Math.random() * 50])
          .addTo(map);
      })
    })
  }

  render() {
    const style = {
      width: '100%',
      height: '600px'
    }

    return <div style={style} ref={el => this.mapContainer = el} />
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch);
}

export default connect(null, mapDispatchToProps)(Mapbox)
