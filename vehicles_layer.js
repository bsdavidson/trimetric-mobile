import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";

import Mapbox from "@mapbox/react-native-mapbox-gl";

import {MIN_LABEL_LAYER_ID} from "./App";

// VehiclePoints example:
//
// {
//   type: "FeatureCollection",
//   features: [
//   {
//     geometry: {
//       type: "Point",
//       coordinates: [-122.570694, 45.463062]
//     },
//     properties: {
//       icon: "tram",
//       route_id: "200",
//       type: "vehicle",
//       vehicle_id: "124"
//     },
//     type: "Feature"
//   },
//  ...
// ]}
//
// args:
// filter = {type:"vehicle_id", value: "1234"}

export function VehiclesLayer(vehiclePoints, filter) {
  if (!vehiclePoints) {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource
        id="vehicle_symbols_source"
        images={{
          assets: ["bus", "tram"]
        }}
        shape={vehiclePoints}>
        <Mapbox.SymbolLayer
          id="vehicle_symbols_layer"
          style={mapStyles.vehicleSymbolsLayer}
          belowLayerID={MIN_LABEL_LAYER_ID}
          filter={
            filter ? ["==", filter.type, filter.value] : ["!=", "test", "123"]
          }
        />
      </Mapbox.ShapeSource>

      <Mapbox.ShapeSource id="vehicle_points_source" shape={vehiclePoints}>
        <Mapbox.CircleLayer
          id="vehicle_points_layer"
          maxZoomLevel={13}
          style={mapStyles.vehiclePointsLayer}
          belowLayerID={MIN_LABEL_LAYER_ID}
          filter={
            filter ? ["==", filter.type, filter.value] : ["!=", "test", "123"]
          }
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

const mapStyles = Mapbox.StyleSheet.create({
  vehicleSymbolsLayer: {
    iconImage: "{icon}",
    iconAllowOverlap: true,
    iconOpacity: 1,
    textField: "{route_id}",
    textOffset: [0, -1],
    textHaloColor: "#FFFFFF",
    textHaloWidth: 3,
    iconSize: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 0.04,
        13: 0.1,
        18: 0.3
      },
      Mapbox.InterpolationMode.Linear
    )
  },
  vehiclePointsLayer: {
    circleColor: Mapbox.StyleSheet.source(
      {
        0: "#FF00FF",
        3: "#FF000F"
      },
      "routeType",
      Mapbox.InterpolationMode.Categorical
    ),
    circleOpacity: 0.0,
    circleRadius: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 2,
        10: 2.4,
        13: 6
      },
      Mapbox.InterpolationMode.Linear
    )
  }
});
