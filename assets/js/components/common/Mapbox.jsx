import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'

class Mapbox extends Component {
  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWxsZW5hbiIsImEiOiJjajNtNTF0Z2QwMDBkMzdsNngzbW4wczJkIn0.vLlTjNry3kcFE7zgXeHNzQ'

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9'
    });
  }

  render() {
    return <div id='map' style={{width: '100%', height: '600px'}}></div>
  }
}

export default Mapbox
