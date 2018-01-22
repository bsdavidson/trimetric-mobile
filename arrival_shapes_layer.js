import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {connect} from "react-redux";
import {lineString} from "@turf/helpers";

import {MIN_LABEL_LAYER_ID, EXCLUDE_ALL, INCLUDE_ALL} from "./constants";

function tripShape(selectedArrival) {
  let trip =
    selectedArrival && selectedArrival.item && selectedArrival.item.trip_shape;
  if (!trip) {
    return {
      type: "FeatureCollection",
      features: []
    };
  }
  return {
    type: "Feature",
    properties: {
      color: "#" + trip.color,
      route_id: trip.route_id
    },
    geometry: {
      type: "LineString",
      coordinates: trip.points.map(p => [p.lng, p.lat])
    }
  };
}

function ArrivalShapesLayer(props) {
  const {selectedArrival} = props;

  return (
    <Mapbox.ShapeSource
      id="arrival_shapes_source"
      shape={tripShape(selectedArrival)}>
      <Mapbox.LineLayer
        id="arrival_shapes_layer"
        belowLayerID={MIN_LABEL_LAYER_ID}
        style={[
          mapStyles.layer,
          {visibility: selectedArrival ? "visible" : "hidden"}
        ]}
      />
    </Mapbox.ShapeSource>
  );
}

function mapStateToProps(state) {
  return {
    selectedArrival: state.selectedArrival
  };
}

export default connect(mapStateToProps)(ArrivalShapesLayer);

const mapStyles = Mapbox.StyleSheet.create({
  layer: {
    lineColor: Mapbox.StyleSheet.identity("color"),
    lineOpacity: 1,
    lineWidth: 3
  }
});
