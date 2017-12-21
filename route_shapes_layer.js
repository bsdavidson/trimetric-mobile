import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";

import {MIN_LABEL_LAYER_ID} from "./App";

// Setting a filter to match a non-existing attribute effectivly hides all the
// elements in the layer.
const EXCLUDE_ALL = ["==", "invalid_attribute", "1"];
// By filtering using a != against a non-existing attrib
// effectivly shows all
const INCLUDE_ALL = ["!=", "non_existing_attribute", "1"];

export function RouteShapesLayer(routeShapes, filter) {
  if (!routeShapes) {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource id="route_shapes_source" shape={routeShapes}>
        <Mapbox.LineLayer
          id="route_shapes_layer"
          belowLayerID={MIN_LABEL_LAYER_ID}
          filter={filter ? EXCLUDE_ALL : INCLUDE_ALL}
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
