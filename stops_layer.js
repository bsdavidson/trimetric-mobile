import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";

import {MIN_LABEL_LAYER_ID} from "./App";

export function StopsLayer(stopPoints, filter) {
  if (!stopPoints) {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource
        id="stop_symbols_source"
        shape={stopPoints}
        images={{
          assets: ["stop"]
        }}>
        <Mapbox.SymbolLayer
          id="stop_symbols_layer"
          minZoomLevel={13}
          filter={
            filter ? ["==", filter.type, filter.value] : ["!=", "test", "123"]
          }
          belowLayerID={MIN_LABEL_LAYER_ID}
          style={mapStyles.stopSymbolsLayer}
        />
      </Mapbox.ShapeSource>

      <Mapbox.ShapeSource id="stop_points_source" shape={stopPoints}>
        <Mapbox.CircleLayer
          id="stop_points_layer"
          maxZoomLevel={13}
          filter={
            filter ? ["==", filter.type, filter.value] : ["!=", "test", "123"]
          }
          belowLayerID={MIN_LABEL_LAYER_ID}
          style={mapStyles.stopPointsLayer}
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

const mapStyles = Mapbox.StyleSheet.create({
  stopPointsLayer: {
    circleColor: "#555555",
    circleOpacity: 0.8,
    circleRadius: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 1,
        10: 1.2,
        13: 3
      },
      Mapbox.InterpolationMode.Linear
    )
  },
  stopSymbolsLayer: {
    iconImage: "marker-15",
    iconAllowOverlap: true,

    iconSize: Mapbox.StyleSheet.camera(
      {
        13: 0.5,
        18: 1.5
      },
      Mapbox.InterpolationMode.Linear
    )
  }
});
