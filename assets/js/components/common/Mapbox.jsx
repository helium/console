import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from '!mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJtYWluIiwiYSI6ImNrczZkZTByazA4eWwycHA1OTV4Mml1OWcifQ.WRdWVfa35mv_9VogDL40xw'

export default (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [lng, lat],
      zoom: zoom
    });
  });

  return (
    <div>
      <div ref={mapContainer} style={{ height: 600 }} />
    </div>
  )
}
