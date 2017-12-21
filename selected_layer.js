import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";

import {MIN_LABEL_LAYER_ID} from "./App";

export function SelectedLayer(selectedPoints, pressedBox) {
  if (!selectedPoints) {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource id="selected_box_source" shape={pressedBox}>
        <Mapbox.LineLayer
          id="pressed_box_layer"
          style={mapStyles.pressedLineLayer}
          belowLayerID={MIN_LABEL_LAYER_ID}
        />
      </Mapbox.ShapeSource>
      <Mapbox.ShapeSource id="pressed_points_source" shape={selectedPoints}>
        <Mapbox.CircleLayer
          id="pressed_points_layer"
          style={mapStyles.pressedPointsLayer}
          belowLayerID={MIN_LABEL_LAYER_ID}
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

const mapStyles = Mapbox.StyleSheet.create({
  pressedPointsLayer: {
    circleColor: "rgba(0,0,0,0)",
    circleStrokeWidth: 2,
    circleStrokeOpacity: 0.5,
    circleStrokeColor: "#00FFFF",
    // circleTranslate: {x: 1.5, y: 0},
    circleRadius: 14
  },
  pressLineLayer: {
    lineColor: "#00FF00",
    lineOpacity: 1,
    lineWidth: 3
  }
});
