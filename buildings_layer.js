import React, {Component} from "react";
import {StyleSheet, View} from "react-native";
import {connect} from "react-redux";

import Mapbox from "@mapbox/react-native-mapbox-gl";

export function BuildingsLayer(props) {
  if (!props.layerVisibility) {
    return null;
  }
  return (
    <Mapbox.VectorSource>
      <Mapbox.FillExtrusionLayer
        id="building3d"
        sourceLayerID="building"
        style={[
          mapStyles.building,
          {
            visibility: props.layerVisibility.buildings ? "visible" : "none"
          }
        ]}
      />
    </Mapbox.VectorSource>
  );
}

function mapStateToProps(state) {
  return {
    layerVisibility: state.layerVisibility
  };
}

export default connect(mapStateToProps)(BuildingsLayer);

const mapStyles = Mapbox.StyleSheet.create({
  building: {
    fillExtrusionOpacity: 0.5,
    fillExtrusionHeight: Mapbox.StyleSheet.identity("height"),
    fillExtrusionBase: Mapbox.StyleSheet.identity("min_height"),
    fillExtrusionColor: "#FFFFFF"
  }
});
