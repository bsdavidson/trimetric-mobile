import React, {Component} from "react";
import {StyleSheet, View} from "react-native";
import {connect} from "react-redux";

import Mapbox from "@mapbox/react-native-mapbox-gl";

import {MIN_LABEL_LAYER_ID} from "./constants";
import {getSelectedItem} from "./selectors";

export function SelectedLayer(props) {
  const {selectedItem} = props;
  if (!selectedItem || selectedItem.type === "vehicle") {
    return null;
  }
  return (
    <View>
      <Mapbox.ShapeSource id="pressed_points_source" shape={selectedItem.item}>
        <Mapbox.CircleLayer
          id="pressed_points_layer"
          style={mapStyles.pressedPointsLayer}
          belowLayerID={MIN_LABEL_LAYER_ID}
        />
      </Mapbox.ShapeSource>
    </View>
  );
}

function mapStateToProps(state) {
  return {
    selectedItem: getSelectedItem(state)
  };
}

export default connect(mapStateToProps)(SelectedLayer);

const mapStyles = Mapbox.StyleSheet.create({
  pressedPointsLayer: {
    circleColor: "rgba(0,0,0,0)",
    circleStrokeWidth: 2,
    circleStrokeOpacity: 0.5,
    circleStrokeColor: "#00FFFF",
    circleRadius: 14
  },
  pressLineLayer: {
    lineColor: "#00FF00",
    lineOpacity: 1,
    lineWidth: 3
  }
});
