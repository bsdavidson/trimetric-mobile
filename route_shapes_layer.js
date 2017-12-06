import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";

import {MIN_LABEL_LAYER_ID} from "./App";

export function RouteShapesLayer(routeShapes) {
  if (!routeShapes) {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource id="route_shapes_source" shape={routeShapes}>
        <Mapbox.LineLayer
          id="route_shapes_layer"
          belowLayerID={MIN_LABEL_LAYER_ID}
          style={mapStyles.routeShapesLayer}
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

const mapStyles = Mapbox.StyleSheet.create({
  routeShapesLayer: {
    lineColor: Mapbox.StyleSheet.identity("color"),
    lineOpacity: 1,
    lineWidth: 3
  }
});
