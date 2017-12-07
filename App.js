/**
 * @flow
 */
import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {feature} from "@turf/helpers";

import {VehiclesLayer} from "./vehicles_layer";
import {StopsLayer} from "./stops_layer";
import {RouteShapesLayer} from "./route_shapes_layer";
import {SelectedLayer} from "./selected_layer";
import BottomDrawer from "./bottom_drawer";
import {updateSelectedItems} from "./actions";
import {
  getVehiclePoints,
  getSelectedItemsInfo,
  getStopPoints
} from "./selectors";
import {setTimeout} from "core-js/library/web/timers";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiYnNkYXZpZHNvbiIsImEiOiJjamExeWFwb3A5aWRlMndzNHBtNW40dDhlIn0.YQwDCQqvNFVwT8JlOBPvwg"
);

const TOUCH_HALF_SIZE = 44 / 2;

// This is the first layer ID containing labels from MapBox's light style.
// All Trimetric layers should appear beneath this. The JavaScript SDK allows
// this to be queried dynamically using map.getStyle().layers, but the react native
// map doesn't seem to expose that.
export const MIN_LABEL_LAYER_ID = "road-label-small";

export class App extends Component {
  constructor(props) {
    super(props);

    this.mapRef = null;
    this.state = {
      zoomLevel: 0,
      pressedPoints: {type: "FeatureCollection", features: []}
    };

    this.timeout = null;
    this.handleMapRef = this.handleMapRef.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.handleRegionDidChange = this.handleRegionDidChange.bind(this);
    this.renderInfoModal = this.renderInfoModal.bind(this);
  }

  handleRegionDidChange(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({
        zoomLevel: event.properties.zoomLevel
      });
    }, 100);
  }

  handleMapRef(map) {
    this.mapRef = map;
  }

  async handlePress(e) {
    console.log("press", e);
    const {screenPointX, screenPointY} = e.properties;

    let collection = await this.mapRef.queryRenderedFeaturesInRect(
      [
        screenPointY + TOUCH_HALF_SIZE,
        screenPointX + TOUCH_HALF_SIZE,
        screenPointY - TOUCH_HALF_SIZE,
        screenPointX - TOUCH_HALF_SIZE
      ],
      null,
      ["stop_symbols_layer", "vehicle_symbols_layer"]
    );
    this.props.onSelectItems({
      type: "FeatureCollection",
      features: collection.features.map(f => ({
        type: "Feature",
        properties: f.properties,
        geometry: f.geometry
      }))
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedItem === nextProps.selectedItem) {
      return;
    }
    if (nextProps.selectedItem.type !== "stop") {
      return;
    }
    this.mapRef.setCamera({
      centerCoordinate: [
        nextProps.selectedItem.stop.lng,
        nextProps.selectedItem.stop.lat
      ],
      zoom: 16,
      duration: 500
    });
  }

  renderInfoModal() {
    if (this.props.selectedItems.features.length === 0) {
      return null;
    }
    return <BottomDrawer data={this.props.selectedItemsInfo} />;
  }

  render() {
    return (
      <View style={styles.map}>
        <Mapbox.MapView
          styleURL={Mapbox.StyleURL.Light}
          zoomLevel={13}
          centerCoordinate={[-122.6865, 45.508]}
          onRegionDidChange={this.handleRegionDidChange}
          onPress={this.handlePress}
          ref={this.handleMapRef}
          style={styles.map}>
          {/* <Mapbox.VectorSource>
            <Mapbox.FillExtrusionLayer
              id="poopy_butthole"
              sourceID="composite"
              sourceLayerID="building"
              filter={["==", "extrude", "true"]}
              minZoomLevel={15}
              style={mapStyles.building}
            />
          </Mapbox.VectorSource> */}

          {SelectedLayer(this.props.selectedItems)}
          {RouteShapesLayer(this.props.routeShapes)}
          {StopsLayer(this.props.stopPoints)}
          {VehiclesLayer(this.props.vehiclePoints)}
        </Mapbox.MapView>
        {this.renderInfoModal()}
      </View>
    );
  }
}

const mapStyles = Mapbox.StyleSheet.create({
  building: {
    fillExtrusionOpacity: 1,
    fillExtrusionHeight: Mapbox.StyleSheet.identity("height"),
    fillExtrusionBase: Mapbox.StyleSheet.identity("min_height"),
    fillExtrusionColor: "#FFFFFF"
  }
});

const styles = StyleSheet.create({
  map: {
    flex: 1
  }
});

function mapDispatchToProps(dispatch) {
  return {
    onSelectItems: items => {
      dispatch(updateSelectedItems(items));
    }
  };
}

function mapStateToProps(state) {
  return {
    routeShapes: state.routeShapes,
    selectedItems: state.selectedItems,
    selectedItem: state.selectedItem,
    stopPoints: getStopPoints(state),
    selectedItemsInfo: getSelectedItemsInfo(state),
    vehiclePoints: getVehiclePoints(state)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
