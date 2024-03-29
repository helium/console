import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl";
import startCase from "lodash/startCase";

mapboxgl.accessToken =
  window.mapbox_pk ||
  process.env.MAPBOX_PRIVATE_KEY ||
  "pk.eyJ1IjoidmljbWdzIiwiYSI6ImNraGNkdnVseDA0NTMyeW94N3lyYWRiZmIifQ.yl0UT_-yc7i8t2EF0xgurg";

export default ({ orgHotspotsMap, data }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const DEFAULT_LNG = -70.9;
  const DEFAULT_LAT = 42.35;
  const DEFAULT_ZOOM = 10;
  const [showMap, setShowMap] = useState(false);

  const generateMapPoints = () => {
    let results = [];
    data.forEach((h) => {
      const hotspot_alias =
        (orgHotspotsMap &&
          orgHotspotsMap[h.hotspot_address] &&
          orgHotspotsMap[h.hotspot_address].alias) ||
        "";
      const isPreferred =
        (orgHotspotsMap &&
          orgHotspotsMap[h.hotspot_address] &&
          orgHotspotsMap[h.hotspot_address].preferred) ||
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
          colorLabel:
            orgHotspotsMap && h.hotspot_address in orgHotspotsMap
              ? isPreferred
                ? "preferred"
                : "followed"
              : "unfollowed",
          isPreferred,
          ...(isEitherCoordNaN && { invalid_coordinates: true }),
        },
      });
    });
    return results;
  };

  const [mapPoints, setMapPoints] = useState(generateMapPoints());

  const loadMapPoints = () => {
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
  };

  useEffect(() => {
    setMapPoints(generateMapPoints());
  }, [orgHotspotsMap, data]);

  useEffect(() => {
    if (map.current) {
      if (popup.current) {
        popup.current.remove();
      }
      if (map.current.getSource("hotspots-points-data")) {
        loadMapPoints();
      } else {
        setTimeout(function () {
          loadMapPoints();
        }, 2000);
      }
    }
  }, [mapPoints]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        window.mapbox_style_url ||
        process.env.MAPBOX_STYLE_URL ||
        "mapbox://styles/mapbox/dark-v9",
      center: (mapPoints.length > 0 && mapPoints[0].geometry.coordinates) || [
        DEFAULT_LNG,
        DEFAULT_LAT,
      ],
      zoom: DEFAULT_ZOOM,
      maxZoom: DEFAULT_ZOOM,
    });

    map.current.on("load", function () {
      map.current.resize();
      setShowMap(true);

      // add the data source for new a feature collection with no features
      map.current.addSource("hotspots-points-data", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 5, // Max zoom to cluster points on
        clusterRadius: 40, // Radius of each cluster when clustering points (defaults to 50)
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
            ["get", "colorLabel"],
            "followed",
            "#2C79EE",
            "preferred",
            "#2BCC4F",
            "unfollowed",
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

        popup.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnMove: true,
        })
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
