import React, {Component} from "react";
import {StyleSheet, View} from "react-native";
import {connect} from "react-redux";

import Mapbox from "@mapbox/react-native-mapbox-gl";
import {lineString} from "@turf/helpers";

import {MIN_LABEL_LAYER_ID, EXCLUDE_ALL, INCLUDE_ALL} from "./constants";
import {getRouteShapeFeatures} from "./selectors";

export function RouteShapesLayer(props) {
  const {routeShapes, visible, selectedArrival} = props;
  if (!routeShapes) {
    return null;
  }

  return (
    <Mapbox.ShapeSource id="route_shapes_source" shape={routeShapes}>
      <Mapbox.LineLayer
        id="route_shapes_layer"
        belowLayerID={MIN_LABEL_LAYER_ID}
        style={[mapStyles.layer, {visibility: visible ? "visible" : "none"}]}
      />
    </Mapbox.ShapeSource>
  );
}

export function mapStateToProps(state) {
  return {
    routeShapes: getRouteShapeFeatures(state),
    selectedArrival: state.selectedArrival,
    visible: state.layerVisibility.routeShapes && !state.selectedArrival
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
