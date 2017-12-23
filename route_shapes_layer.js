import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {connect} from "react-redux";
import {lineString} from "@turf/helpers";

import {MIN_LABEL_LAYER_ID, EXCLUDE_ALL, INCLUDE_ALL} from "./App";
import {getRouteShapeFeatures} from "./selectors";

function RouteShapesLayer(props) {
  const {routeShapes, visible, selectedArrival} = props;
  if (!routeShapes) {
    return null;
  }
  return (
    <Mapbox.ShapeSource id="route_shapes_source" shape={routeShapes}>
      <Mapbox.LineLayer
        id="route_shapes_layer"
        belowLayerID={MIN_LABEL_LAYER_ID}
        style={[mapStyles.layer, {visibility: visible ? "visible" : "hidden"}]}
      />
    </Mapbox.ShapeSource>
  );
}

function mapStateToProps(state) {
  return {
    visible: state.layerVisibility.routeShapes && !state.selectedArrival,
    routeShapes: getRouteShapeFeatures(state),
    selectedArrival: state.selectedArrival
  };
}

export default connect(mapStateToProps)(RouteShapesLayer);

const mapStyles = Mapbox.StyleSheet.create({
  layer: {
    lineColor: Mapbox.StyleSheet.identity("color"),
    lineOpacity: 1,
    lineWidth: 3
  }
});
