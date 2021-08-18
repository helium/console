import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from '!mapbox-gl'

mapboxgl.accessToken =
  window.mapbox_pk || process.env.MAPBOX_PRIVATE_KEY || 'pk.eyJ1IjoiYWxsZW5hbiIsImEiOiJjajNtNTF0Z2QwMDBkMzdsNngzbW4wczJkIn0.vLlTjNry3kcFE7zgXeHNzQ'


export default (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', function () {
      map.current.resize();
      setShowMap(true)
    })
  });

  return (
    <div ref={mapContainer} style={{ height: '100%', visibility: showMap ? 'visible' : 'hidden' }} />
  )
}
