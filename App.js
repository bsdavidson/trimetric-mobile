/**
 * @flow
 */
import React, {Component} from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  View,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Switch
} from "react-native";
import {connect} from "react-redux";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {feature, lineString} from "@turf/helpers";

import VehiclesLayer from "./vehicles_layer";
import StopsLayer from "./stops_layer";
import RouteShapesLayer from "./route_shapes_layer";
import ArrivalShapesLayer from "./arrival_shapes_layer";
import SelectedLayer from "./selected_layer";
import SelectedItemsView from "./selected_items_view";
import LayersMenu from "./layers_menu";
import {
  updateSelectedItems,
  selectItemIndex,
  updateLayerVisibility
} from "./actions";
import {
  getVehiclePoints,
  getSelectedItemsInfo,
  getVehicleInfoFromArrival,
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
// Setting a filter to match a non-existing attribute effectivly hides all the
// elements in the layer.
export const EXCLUDE_ALL = ["==", "non_existing_attribute", "1"];
// By filtering using a != against a non-existing attrib
// effectivly shows all
export const INCLUDE_ALL = ["!=", "non_existing_attribute", "1"];

export class App extends Component {
  constructor(props) {
    super(props);

    this.mapRef = null;
    this.state = {
      zoomLevel: 0,
      pressedPoints: {type: "FeatureCollection", features: []},
      pressedBox: null
    };

    this.stopLen = 0;
    this.vehicleLen = 0;
    this.lineLen = 0;
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
    this.moveCameraToArrival = this.moveCameraToArrival.bind(this);
  }

  componentDidUpdate() {
    let stopsLoaded = false;
    let linesLoaded = false;
    let vehiclesLoaded = false;
    let stopLen = this.props.stopPoints.features.length;
    let lineLen = this.props.routeShapes.features.length;
    let vehicleLen = this.props.vehiclePoints.features.length;
    if (stopLen > 0 && stopLen === this.stopLen) {
      stopsLoaded = true;
    }
    if (vehicleLen > 0 && vehicleLen === this.vehicleLen) {
      vehiclesLoaded = true;
    }
    if (lineLen > 0 && lineLen === this.lineLen) {
      linesLoaded = true;
    }

    this.stopLen = stopLen;
    this.lineLen = lineLen;
    this.vehicleLen = vehicleLen;
    if (stopsLoaded && linesLoaded && vehiclesLoaded) {
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

    // [-122.68406935038496, 45.51761313407388]
    // [-122.68809266386711, 45.51259867961565]
    let screenWidth = Dimensions.get("window").width;
    let screenHeight = Dimensions.get("window").height;
    let screenMaxY = (screenPointY + TOUCH_HALF_SIZE + 10) / screenHeight;
    let screenMaxX = (screenPointX + TOUCH_HALF_SIZE + 10) / screenWidth;
    let screenMinY = (screenPointY - TOUCH_HALF_SIZE - 10) / screenHeight;
    let screenMinX = (screenPointX - TOUCH_HALF_SIZE - 10) / screenWidth;

    // bounds [2][2]float64
    // bounds[0] ne bounds[1]sw
    // bounds[0][0] X lng  width
    // bounds [0][1] Y lat height
    // lat increases to the north
    // lng increases to the east

    let bounds = await this.mapRef.getVisibleBounds();
    let boundsHeight = bounds[0][1] - bounds[1][1];
    let boundsWidth = bounds[0][0] - bounds[1][0];

    let pressedBounds = [[], [], [], [], []];

    pressedBounds[0][0] = bounds[1][0] + boundsWidth * screenMinX;
    pressedBounds[0][1] = bounds[0][1] - boundsHeight * screenMinY;

    pressedBounds[1][0] = bounds[1][0] + boundsWidth * screenMaxX;
    pressedBounds[1][1] = bounds[0][1] - boundsHeight * screenMinY;

    pressedBounds[2][0] = bounds[1][0] + boundsWidth * screenMaxX;
    pressedBounds[2][1] = bounds[0][1] - boundsHeight * screenMaxY;

    pressedBounds[3][0] = bounds[1][0] + boundsWidth * screenMinX;
    pressedBounds[3][1] = bounds[0][1] - boundsHeight * screenMaxY;

    pressedBounds[4][0] = bounds[1][0] + boundsWidth * screenMinX;
    pressedBounds[4][1] = bounds[0][1] - boundsHeight * screenMinY;
    this.setState({pressedBox: lineString(pressedBounds)});

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
      if (this.props.selectedArrivalVehicleInfo) {
        // We are currently looking at an arrival, so set the camera accordingly
        let pos1 = [
          this.props.selectedArrivalVehicleInfo.position.lng,
          this.props.selectedArrivalVehicleInfo.position.lat
        ];
        let pos2 = this.props.selectedItem.position;

        this.moveCameraToArrival(pos1, pos2);
        return;
      }

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
          <Text>Reticulated Splines: {this.stopLen}</Text>
        </View>
        <View>
          <Text>Aligned Polyfills: {this.vehicleLen}</Text>
        </View>
        <View>
          <Text>Rendered Quentiles: {this.lineLen}</Text>
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
        <RouteShapesLayer />
        <ArrivalShapesLayer />
        <StopsLayer />
        <VehiclesLayer />
        <SelectedLayer />
      </Mapbox.MapView>
    );

    return (
      <View style={styles.map}>
        {page}
        {this.renderInfoModal()}
        <LayersMenu />
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

    if (
      this.props.selectedItem &&
      this.props.selectedItem.position[0] ===
        nextProps.selectedItem.position[0] &&
      this.props.selectedItem.position[1] === nextProps.selectedItem.position[1]
    ) {
      return;
    }

    this.mapRef.setCamera({
      centerCoordinate: nextProps.selectedItem.position,
      zoom: 16,
      duration: 600
    });
    return true;
  }

  moveCameraToArrival(pos1, pos2) {
    let ne = [Math.max(pos1[0], pos2[0]), Math.max(pos1[1], pos2[1])];
    let sw = [Math.min(pos1[0], pos2[0]), Math.min(pos1[1], pos2[1])];

    Platform.OS === "android"
      ? this.mapRef.setCamera({
          centerCoordinate: pos1,
          zoom: 14,
          duration: 600,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0
        })
      : this.mapRef.setCamera({
          bounds: {
            ne: ne,
            sw: sw,
            paddingLeft: 40,
            paddingRight: 40,
            paddingTop: 40,
            paddingBottom: 40
          },
          duration: 600,
          mode: Mapbox.CameraModes.Flight
        });

    return true;
  }

  selectedArrivalCameraMove(nextProps) {
    if (!nextProps.selectedArrival) {
      return false;
    }

    if (!nextProps.selectedArrivalVehicleInfo) {
      return false;
    }

    if (
      this.props.selectedArrivalVehicleInfo &&
      this.props.selectedArrivalVehicleInfo.position.lng ===
        nextProps.selectedArrivalVehicleInfo.position.lng
    ) {
      return false;
    }

    let pos1 = [
      nextProps.selectedArrivalVehicleInfo.position.lng,
      nextProps.selectedArrivalVehicleInfo.position.lat
    ];
    let pos2 = nextProps.selectedItem.position;
    this.moveCameraToArrival(pos1, pos2);
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
    layerVisibility: state.layerVisibility,
    mapViewInset: state.mapViewInset,
    routeShapes: state.routeShapes,
    selectedArrival: state.selectedArrival,
    selectedArrivalVehicleInfo: getVehicleInfoFromArrival(state),
    selectedItem: getSelectedItem(state),
    selectedItemsInfo: getSelectedItemsInfo(state),
    stopPoints: getStopPoints(state),
    vehiclePoints: getVehiclePoints(state)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
