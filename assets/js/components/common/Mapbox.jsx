import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl";

mapboxgl.accessToken =
  window.mapbox_pk ||
  process.env.MAPBOX_PRIVATE_KEY ||
  "pk.eyJ1IjoiYWxsZW5hbiIsImEiOiJjajNtNTF0Z2QwMDBkMzdsNngzbW4wczJkIn0.vLlTjNry3kcFE7zgXeHNzQ";

export default (props) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [showMap, setShowMap] = useState(false);

  const generateMapPoints = () => {
    let results = [];
    props.data.forEach((h) => {
      results.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [parseFloat(h.longitude), parseFloat(h.latitude)],
        },
        properties: {
          id: h.hotspot_address,
          name: `${h.hotspot_name}`,
          description: `description for hotspot ${h.hotspot_address}`,
        },
      });
    });
    return results;
  };

  const [mapPoints, _setMapPoints] = useState(generateMapPoints());

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/petermain/cksu26oim22gv18o73imni3el", // mapbox://styles/petermain/cksu26oim22gv18o73imni3el || mapbox://styles/mapbox/dark-v9
      center: (mapPoints.length > 0 && mapPoints[0].geometry.coordinates) || [
        lng,
        lat,
      ],
      zoom: zoom,
    });

    const size = 100;

    const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8Array(size * size * 4),

      // When the layer is added to the map,
      // get the rendering context for the map canvas.
      onAdd: function () {
        const canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext("2d");
      },

      // Call once before every frame where the icon will be used.
      render: function () {
        const duration = 1000;
        const t = (performance.now() % duration) / duration;

        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;

        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(44, 121, 238, ${1 - t})`;
        context.fill();

        // Draw the inner circle.
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = "#2C79EE";
        context.strokeStyle = "white";
        context.lineWidth = 2 + 3 * (1 - t);
        context.fill();
        context.stroke();

        // Update this image's data with data from the canvas.
        this.data = context.getImageData(0, 0, this.width, this.height).data;

        // Continuously repaint the map, resulting
        // in the smooth animation of the dot.
        map.current.triggerRepaint();

        // Return `true` to let the map know that the image was updated.
        return true;
      },
    };

    map.current.on("load", function () {
      map.current.resize();
      setShowMap(true);

      map.current.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

      // add the data source for new a feature collection with no features
      map.current.addSource("hotspots-points-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
      });

      // now add the layer, and reference the data source above by name
      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "hotspots-points-data",
        filter: ["has", "point_count"],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          "circle-color": "#2C79EE",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            100,
            30,
            750,
            40,
          ],
        },
      });

      map.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "hotspots-points-data",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      map.current.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "hotspots-points-data",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#2C79EE",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
        },
      });

      map.current.getSource("hotspots-points-data").setData({
        type: "FeatureCollection",
        features: mapPoints,
      });

      if (mapPoints.length > 1) {
        var bounds = new mapboxgl.LngLatBounds();

        mapPoints.forEach(function (feature) {
          bounds.extend(feature.geometry.coordinates);
        });

        map.current.fitBounds(bounds, { padding: 80 });
      }
    });
  });

  return (
    <div
      ref={mapContainer}
      style={{ height: "100%", visibility: showMap ? "visible" : "hidden" }}
    />
  );
};
