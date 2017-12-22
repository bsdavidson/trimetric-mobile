import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {connect} from "react-redux";

import {MIN_LABEL_LAYER_ID, EXCLUDE_ALL, INCLUDE_ALL} from "./App";

function RouteShapesLayer(props) {
  const {routeShapes, visible} = props;
  if (!routeShapes) {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource id="route_shapes_source" shape={routeShapes}>
        <Mapbox.LineLayer
          id="route_shapes_layer"
          belowLayerID={MIN_LABEL_LAYER_ID}
          filter={visible ? INCLUDE_ALL : EXCLUDE_ALL}
          style={mapStyles.routeShapesLayer}
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

function mapStateToProps(state) {
  return {
    visible: state.layerVisibility.routeShapes && !state.selectedArrival,
    routeShapes: state.routeShapes
  };
}

export default connect(mapStateToProps)(RouteShapesLayer);

const mapStyles = Mapbox.StyleSheet.create({
  routeShapesLayer: {
    lineColor: Mapbox.StyleSheet.identity("color"),
    lineOpacity: 1,
    lineWidth: 3
  }
});
