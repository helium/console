import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl";
import startCase from "lodash/startCase";

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
      const hotspot_alias =
        (props.orgHotspotsMap &&
          props.orgHotspotsMap[h.hotspot_address] &&
          props.orgHotspotsMap[h.hotspot_address].alias) ||
        "";
      const isEitherCoordNaN =
        isNaN(parseFloat(h.longitude)) || isNaN(parseFloat(h.latitude));
      results.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: isEitherCoordNaN
            ? [0.0, 0.0]
            : [parseFloat(h.longitude), parseFloat(h.latitude)],
        },
        properties: {
          id: h.hotspot_address,
          name: `${h.hotspot_name}`,
          alias: hotspot_alias,
          packetCount: h.packet_count,
          isFollowed: String(h.hotspot_address in props.orgHotspotsMap),
          ...(isEitherCoordNaN && { invalid_coordinates: true }),
        },
      });
    });
    return results;
  };

  const [mapPoints, setMapPoints] = useState(generateMapPoints());

  useEffect(() => {
    setMapPoints(generateMapPoints());
  }, [props.orgHotspotsMap]);

  useEffect(() => {
    map.current &&
      map.current.getSource("hotspots-points-data") &&
      map.current.getSource("hotspots-points-data").setData({
        type: "FeatureCollection",
        features: mapPoints,
      });
  }, [mapPoints]);

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
          "circle-opacity": 0.8,
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
        filter: [
          "all",
          ["!", ["has", "point_count"]],
          ["!", ["has", "invalid_coordinates"]],
        ],
        paint: {
          "circle-color": [
            "match",
            ["get", "isFollowed"],
            "true",
            "#2C79EE",
            "false",
            "#ACB9CD",
            "#ACB9CD",
          ],
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "packetCount"],
            1000,
            6,
            5000,
            9,
            10000,
            12,
            15000,
            15,
            20000,
            20,
            25000,
            25,
            30000,
            30,
            35000,
            35,
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff",
          "circle-opacity": 0.8,
        },
      });

      map.current.getSource("hotspots-points-data").setData({
        type: "FeatureCollection",
        features: mapPoints,
      });

      // inspect a cluster on click
      map.current.on("click", "clusters", (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.current
          .getSource("hotspots-points-data")
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom,
            });
          });
      });

      map.current.on("mouseenter", "clusters", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "clusters", () => {
        map.current.getCanvas().style.cursor = "";
      });
      map.current.on("mouseenter", "unclustered-point", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "unclustered-point", () => {
        map.current.getCanvas().style.cursor = "";
      });

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      map.current.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup({ closeButton: false })
          .setLngLat(coordinates)
          .setHTML(
            `<div style="text-align:center;"><b>${
              e.features[0].properties.alias ||
              startCase(e.features[0].properties.name.replace("-", " "))
            }</b><br/>${e.features[0].properties.packetCount} packets</div>`
          )
          .addTo(map.current);
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
