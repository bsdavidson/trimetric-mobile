/**
 * @flow
 */
import React, {Component} from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from "react-native";
import {connect} from "react-redux";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {feature} from "@turf/helpers";

import {VehiclesLayer} from "./vehicles_layer";
import {StopsLayer} from "./stops_layer";
import {RouteShapesLayer} from "./route_shapes_layer";
import {SelectedLayer} from "./selected_layer";
import SelectedItemsView from "./selected_items_view";
import {updateSelectedItems, selectItemIndex} from "./actions";
import {
  getVehiclePoints,
  getSelectedItemsInfo,
  getSelectedItem,
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

    this.stopLen = 0;
    this.loading = true;
    this.zoomLevelTimeout = null;
    this.cameraTimeout = null;
    this.handleSelectedItemsResize = this.handleSelectedItemsResize.bind(this);
    this.handleMapRef = this.handleMapRef.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.handleLongPress = this.handleLongPress.bind(this);
    this.handleRegionDidChange = this.handleRegionDidChange.bind(this);
    this.renderInfoModal = this.renderInfoModal.bind(this);
    this.selectedItemCameraMove = this.selectedItemCameraMove.bind(this);
  }

  componentDidUpdate() {
    let stopsLoaded = false;
    let stopLen = this.props.stopPoints.features.length;
    if (stopLen > 0 && stopLen === this.stopLen) {
      stopsLoaded = true;
    }
    this.stopLen = stopLen;
    if (this.props.routeShapes && stopsLoaded && this.props.vehiclePoints) {
      this.loading = false;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.selectedItemCameraMove(nextProps);
    this.selectedArrivalCameraMove(nextProps);
  }

  handleMapRef(map) {
    this.mapRef = map;
  }

  handleRegionDidChange(event) {
    clearTimeout(this.zoomLevelTimeout);
    this.zoomLevelTimeout = setTimeout(() => {
      this.setState({
        zoomLevel: event.properties.zoomLevel
      });
    }, 100);
  }

  async handlePress(e) {
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

  async handleLongPress(e) {
    console.log("Long Press");
    await this.mapRef.setCamera({
      bounds: {
        ne: [-122.67752, 45.515785],
        sw: [-122.6775214, 45.5209311],

        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0
      },
      duration: 600,
      mode: Mapbox.CameraModes.Flight
    });
  }

  handleSelectedItemsResize() {
    if (
      !this.mapRef ||
      !this.props.selectedItem ||
      !this.props.selectedItem.position
    ) {
      return;
    }

    if (this.cameraTimeout) {
      clearTimeout(this.cameraTimeout);
    }

    this.cameraTimeout = setTimeout(() => {
      this.mapRef.setCamera({
        centerCoordinate: this.props.selectedItem.position,
        zoom: 16,
        duration: 600
      });
    }, Platform.OS === "ios" ? 100 : 0);
  }

  renderInfoModal() {
    if (this.props.selectedItemsInfo.length === 0) {
      return null;
    }
    return (
      <SelectedItemsView
        onResize={this.handleSelectedItemsResize}
        data={this.props.selectedItemsInfo}
      />
    );
  }

  render() {
    let page = this.loading ? (
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}>
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
        <View>
          <Text>Reticulating Splines: {this.stopLen}</Text>
        </View>
      </View>
    ) : (
      <Mapbox.MapView
        styleURL={Mapbox.StyleURL.Light}
        zoomLevel={13}
        centerCoordinate={[-122.6865, 45.508]}
        contentInset={this.props.mapViewInset}
        onRegionDidChange={this.handleRegionDidChange}
        onPress={this.handlePress}
        onLongPress={this.handleLongPress}
        ref={this.handleMapRef}
        style={styles.map}>
        {this.props.selectedItem
          ? SelectedLayer(this.props.selectedItem.item)
          : null}
        {RouteShapesLayer(this.props.routeShapes)}
        {StopsLayer(this.props.stopPoints)}
        {VehiclesLayer(
          this.props.vehiclePoints,
          this.props.selectedArrival &&
          this.props.selectedArrival.item &&
          this.props.selectedArrival.item.vehicle_id
            ? {
                type: "vehicle_id",
                value: this.props.selectedArrival.item.vehicle_id
              }
            : null
        )}
      </Mapbox.MapView>
    );

    return (
      <View style={styles.map}>
        {page}
        {this.renderInfoModal()}
      </View>
    );
  }

  selectedItemCameraMove(nextProps) {
    if (!nextProps.selectedItem) {
      return false;
    }
    if (this.props.selectedItem === nextProps.selectedItem) {
      return false;
    }

    if (!nextProps.selectedItem.position) {
      return false;
    }

    this.mapRef.setCamera({
      centerCoordinate: nextProps.selectedItem.position,
      zoom: 16,
      duration: 600
    });
    return true;
  }

  selectedArrivalCameraMove(nextProps) {
    if (!nextProps.selectedArrival) {
      return false;
    }
    if (this.props.selectedArrival === nextProps.selectedArrival) {
      return false;
    }

    if (!nextProps.selectedArrival.item.vehicle_position) {
      return false;
    }
    let pos1 = [
      nextProps.selectedArrival.item.vehicle_position.lng,
      nextProps.selectedArrival.item.vehicle_position.lat
    ];
    let pos2 = nextProps.selectedItem.position;

    let ne = [Math.max(pos1[0], pos2[0]), Math.max(pos1[1], pos2[1])];
    let sw = [Math.min(pos1[0], pos2[0]), Math.min(pos1[1], pos2[1])];
    this.mapRef.setCamera({
      bounds: {
        ne: ne,
        sw: sw,

        paddingLeft: 40,
        paddingRight: 40,
        paddingTop: 20,
        paddingBottom: 20
      },
      duration: 600,
      mode: Mapbox.CameraModes.Flight
    });

    return true;
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
    mapViewInset: state.mapViewInset,
    routeShapes: state.routeShapes,
    selectedArrival: state.selectedArrival,
    selectedItem: getSelectedItem(state),
    selectedItemsInfo: getSelectedItemsInfo(state),
    stopPoints: getStopPoints(state),
    vehiclePoints: getVehiclePoints(state)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
