import React, {Component} from "react";
import {Platform, StyleSheet, Text, View, PixelRatio} from "react-native";
import {connect} from "react-redux";

import Mapbox from "@mapbox/react-native-mapbox-gl";

import bus from "./assets/bus.png";
import tram from "./assets/tram.png";

import {MIN_LABEL_LAYER_ID, EXCLUDE_ALL, INCLUDE_ALL} from "./constants";
import {getVehiclePoints, getSelectedItem} from "./selectors";

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

export function VehiclesLayer(props) {
  const {vehiclePoints, filter, labelsVisible} = props;

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
          style={[
            mapStyles.vehicleSymbolsLayer,
            {textField: labelsVisible ? "{route_id}" : ""}
          ]}
          belowLayerID={MIN_LABEL_LAYER_ID}
          filter={filter}
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

export function mapStateToProps(state) {
  let id;
  const selectedItem = getSelectedItem(state);
  if (selectedItem && selectedItem.item && selectedItem.type === "vehicle") {
    id = selectedItem.item.properties.vehicle_id;
  } else if (
    state.selectedArrival &&
    state.selectedArrival.item &&
    state.selectedArrival.item.vehicle_id
  ) {
    id = state.selectedArrival.item.vehicle_id;
  }

  let filter = INCLUDE_ALL;

  if (id) {
    filter = ["==", "vehicle_id", id];
  } else if (!state.layerVisibility.buses && !state.layerVisibility.trains) {
    filter = EXCLUDE_ALL;
  } else if (!state.layerVisibility.buses) {
    filter = ["!=", "icon", "bus"];
  } else if (!state.layerVisibility.trains) {
    filter = ["!=", "icon", "tram"];
  }
  return {
    filter,
    vehiclePoints: getVehiclePoints(state),
    labelsVisible: state.layerVisibility.vehicleLabels
  };
}

export default connect(mapStateToProps)(VehiclesLayer);

const mapStyles = Mapbox.StyleSheet.create({
  vehicleSymbolsLayer: {
    iconAllowOverlap: true,
    iconImage: "{icon}",
    iconOpacity: 1,
    iconSize: Mapbox.StyleSheet.camera(
      {
        0: 0,
        9: 0.04,
        13: 0.1,
        18: 0.3
      },
      Mapbox.InterpolationMode.Linear
    ),
    textHaloColor: "#FFFFFF",
    textHaloWidth: 3,
    textOffset: [0, -1],
    textOptional: true
  }
});
