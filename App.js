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
  PixelRatio,
  TouchableOpacity,
  Switch,
  TouchableWithoutFeedback
} from "react-native";
import {connect} from "react-redux";
import Mapbox from "@mapbox/react-native-mapbox-gl";
import {feature, lineString} from "@turf/helpers";
import {bboxPolygon} from "turf";

import ArrivalShapesLayer from "./arrival_shapes_layer";
import DimensionsListener from "./dimension_listener";
import InfoModal from "./info_modal";
import Intro from "./intro";
import LayersMenu from "./layers_menu";
import RouteShapesLayer from "./route_shapes_layer";
import SelectedItemsView from "./selected_items_view";
import SelectedLayer from "./selected_layer";
import StatMenu from "./stat_menu";
import StopsLayer from "./stops_layer";
import VehiclesLayer from "./vehicles_layer";
import DataService from "./data";

import {
  updateSelectedItems,
  selectItemIndex,
  updateLayerVisibility,
  unfollow
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

const TOUCH_HALF_SIZE = 10 / 2;

// This is the first layer ID containing labels from MapBox's light style.
// All Trimetric layers should appear beneath this. The JavaScript SDK allows
// this to be queried dynamically using map.getStyle().layers, but the react native
// map doesn't seem to expose that.
export const MIN_LABEL_LAYER_ID = "place-city-sm";
// Setting a filter to match a non-existing attribute effectivly hides all the
// elements in the layer.
export const EXCLUDE_ALL = ["==", "non_existing_attribute", "1"];
// By filtering using a != against a non-existing attrib
// effectivly shows all
export const INCLUDE_ALL = ["!=", "non_existing_attribute", "1"];
const BOTTOM_STATS_BAR_HEIGHT =
  Platform.OS === "android" ? PixelRatio.getPixelSizeForLayoutSize(40) : 40;

export class App extends Component {
  constructor(props) {
    super(props);

    this.mapRef = null;
    this.state = {
      zoomLevel: 0,
      pressedPoints: {type: "FeatureCollection", features: []},
      pressedBox: null,
      visibleBoxPoly: {}
    };

    this.zoomLevelTimeout = null;
    this.cameraTimeout = null;
    this.handleLongPress = this.handleLongPress.bind(this);
    this.handleMapRef = this.handleMapRef.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.handleRegionDidChange = this.handleRegionDidChange.bind(this);
    this.handleSelectedItemsResize = this.handleSelectedItemsResize.bind(this);
    this.moveCameraToArrival = this.moveCameraToArrival.bind(this);
    this.renderSelectedItemsMenu = this.renderSelectedItemsMenu.bind(this);
    this.selectedItemCameraMove = this.selectedItemCameraMove.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.selectedItemCameraMove(nextProps);
    this.selectedArrivalCameraMove(nextProps);
  }

  handleMapRef(map) {
    this.mapRef = map;
  }

  handleRegionDidChange(event) {
    if (event.properties.isUserInteraction && this.props.following) {
      // Set when the user intentially drags the map. In this case, we want to turn
      // off follow mode to prevent the map from snapping back to the selected
      // item.
      this.props.onMoveMap();
    }
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

  // Handles camera positioning when the selected items menu is opened/closed
  handleSelectedItemsResize() {
    if (
      !this.mapRef ||
      !this.props.selectedItem ||
      !this.props.selectedItem.position
    ) {
      return;
    }

    if (!this.props.following) {
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

  renderSelectedItemsMenu() {
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
    // mode is used to alter the content inset whenever the orientation changes.
    // This forces a re-render in the map to prevent clipping/drawing issues
    // that occur when the map should redraw but doeesn't because it's inputs
    // haven't changed.
    let mode =
      this.props.dimensions.screen.width < this.props.dimensions.screen.height
        ? 1
        : 0;
    const mapBottom = Math.max(
      Platform.OS === "android"
        ? Math.floor(
            PixelRatio.getPixelSizeForLayoutSize(
              this.props.selectedItemsViewHeight
            )
          )
        : this.props.selectedItemsViewHeight,
      BOTTOM_STATS_BAR_HEIGHT
    );
    let page = null;
    console.log(mode, mapBottom);
    if (this.props.loaded) {
      page = (
        <Mapbox.MapView
          styleURL={Mapbox.StyleURL.Light}
          zoomLevel={13}
          centerCoordinate={[-122.6865, 45.508]}
          contentInset={[mode, 0, mapBottom, 0]}
          onRegionDidChange={this.handleRegionDidChange}
          onPress={this.handlePress}
          onLongPress={this.handleLongPress}
          ref={this.handleMapRef}
          style={[styles.map]}>
          <Mapbox.VectorSource>
            <Mapbox.FillExtrusionLayer
              id="building3d"
              sourceLayerID="building"
              style={[
                mapStyles.building,
                {
                  visibility: this.props.layerVisibility.buildings
                    ? "visible"
                    : "none"
                }
              ]}
            />
          </Mapbox.VectorSource>
          <RouteShapesLayer />
          <ArrivalShapesLayer />
          <StopsLayer />
          <VehiclesLayer />
          <SelectedLayer />
        </Mapbox.MapView>
      );
    }

    return (
      <View style={styles.container}>
        <DataService />
        {page}
        <StatMenu />
        <LayersMenu
          display={this.props.selectedItemsViewHeight < 150}
          bottom={Math.max(
            this.props.selectedItemsViewHeight,
            PixelRatio.getPixelSizeForLayoutSize(30)
          )}
        />
        {this.renderSelectedItemsMenu()}
        <InfoModal />
        <DimensionsListener />
        <Intro />
      </View>
    );
  }

  selectedItemCameraMove(nextProps) {
    if (
      nextProps.selectedArrival ||
      !nextProps.following ||
      !nextProps.selectedItem ||
      !nextProps.selectedItem.position
    ) {
      return false;
    }

    if (
      this.props.following &&
      nextProps.following && // If we were not following, but changed to following,
      // we want to ignore the fact that the item didn't change since this would
      // indicate that we dragged away from an item but then reselected it.
      (this.props.selectedItem === nextProps.selectedItem ||
        (this.props.selectedItem &&
          this.props.selectedItem.position[0] ===
            nextProps.selectedItem.position[0] &&
          this.props.selectedItem.position[1] ===
            nextProps.selectedItem.position[1] &&
          this.props.selectedItemsViewHeight ===
            nextProps.selectedItemsViewHeight))
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

    // Android has a bug with the content inset that causes setting the camera
    // to a bounds to get pushed off screen. The workaround involes adding a
    // a stop point to reset the view to center after it sets the zoom.
    Platform.OS === "android"
      ? this.mapRef.setCamera({
          stops: [
            {
              bounds: {
                ne: ne,
                sw: sw,
                paddingLeft: 80,
                paddingRight: 80,
                paddingTop: 80,
                paddingBottom: 80
              },
              duration: 1,
              mode: Mapbox.CameraModes.Flight
            },
            {
              centerCoordinate: [(ne[0] + sw[0]) / 2, (ne[1] + sw[1]) / 2],
              duration: 1
            }
          ]
        })
      : this.mapRef.setCamera({
          bounds: {
            ne: ne,
            sw: sw,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            paddingBottom: 20
          },
          duration: 600,
          mode: Mapbox.CameraModes.Flight
        });

    return true;
  }

  selectedArrivalCameraMove(nextProps) {
    if (
      !nextProps.selectedArrival ||
      !nextProps.following ||
      !nextProps.selectedArrivalVehicleInfo ||
      !nextProps.selectedItem
    ) {
      return false;
    }

    if (
      this.props.following &&
      nextProps.following && // If we were not following, but changed to following,
      // we want to ignore the fact that the item didn't change since this would
      // indicate that we dragged away from an item but then reselected it.
      (this.props.selectedArrivalVehicleInfo &&
        this.props.selectedArrivalVehicleInfo.position.lng ===
          nextProps.selectedArrivalVehicleInfo.position.lng)
    ) {
      return false;
    }

    let pos1 = [
      nextProps.selectedArrivalVehicleInfo.position.lng,
      nextProps.selectedArrivalVehicleInfo.position.lat
    ];
    let pos2 = nextProps.selectedItem.position;
    if (!pos1 || !pos2) {
      return false;
    }
    this.moveCameraToArrival(pos1, pos2);
  }
}

const mapStyles = Mapbox.StyleSheet.create({
  building: {
    fillExtrusionOpacity: 0.5,
    fillExtrusionHeight: Mapbox.StyleSheet.identity("height"),
    fillExtrusionBase: Mapbox.StyleSheet.identity("min_height"),
    fillExtrusionColor: "#FFFFFF"
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  }
});

function mapDispatchToProps(dispatch) {
  return {
    onSelectItems: items => {
      dispatch(updateSelectedItems(items));
    },
    onMoveMap: () => {
      dispatch(unfollow());
    }
  };
}

function mapStateToProps(state) {
  return {
    dimensions: state.dimensions,
    following: state.following,
    loaded: state.loaded,
    layerVisibility: state.layerVisibility,
    selectedItemsViewHeight: state.selectedItemsViewHeight,
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
